const tempData = {
	selectedEntry: null,
};
/*-------------------------------------------------------------------------------------------------------
                                            General
-------------------------------------------------------------------------------------------------------*/

async function loadModule(permissionStr) {
	// create an array from permission string
	const permission = permissionStr.split("").map((p) => parseInt(p));

	if (permission[0] == 0) {
		$("#btnTopAddEntry").hide();
	}

	// load main table
	const dataBuilderFunction = (responseData) => {
		// parse response data and return in data table friendly format
		return responseData.map((entry) => {
			return {
				Code: entry.code,
				Vacancy: entry.jobVacancy.code,
				Position: entry.jobVacancy.position,
				Candidate: entry.candidateProfile.code,
				"Applied Date": entry.addedDate,
				"Review Status": entry.jobApplicationStatus.name,
				View: `<button class="btn btn-success btn-sm" onclick="showEditEntryModal('${entry.id}', true)"><i class="glyphicon glyphicon-eye-open" aria-hidden="true"></i> View</button>`,
			};
		});
	};

	window.mainTable = new DataTable(
		"mainTableHolder",
		"/api/job_application_reviews",
		permission,
		dataBuilderFunction,
		"Job Vacancies List"
	);

	// load main from
	window.mainForm = new Form(
		"mainForm",
		"Job Vacancy Details",
		permission,
		[],
		[
			{ id: "departmentId", route: "/api/departments" },
			{ id: "jobCategoryId", route: "/api/job_categories" },
			{
				id: "jobVacancyStatusId",
				route: "/api/general?data[table]=job_vacancy_status",
			},
		],
		{
			addEntry: null,
			deleteEntry: null,
			updateEntry: null,
		}
	);

	// event listeners for top action buttons
	$("#btnApply").on("click", (e) => {
		e.preventDefault();
		submitApplication();
	});

	// init datetime picker
	$("#idateTime").datetimepicker();

	// catch promise rejections
	$(window).on("unhandledrejection", (event) => {
		console.error(
			"Unhandled rejection (promise: ",
			event.promise,
			", reason: ",
			event.reason,
			")."
		);
	});
}

// reload main table data and from after making a change
const reloadModule = () => {
	mainForm.reset();
	mainTable.reload();
};

/*-------------------------------------------------------------------------------------------------------
                                            Modals
-------------------------------------------------------------------------------------------------------*/

const showNewEntryModal = () => {
	mainForm.reset();
	$("#mainForm #id").val("ID will be displayed after adding.");
	// set date of adding
	$("#mainForm #addedDate").val(new Date().today());

	const username = mainWindow.tempData.profile.username;
	$("#mainForm #createdUser").val(username);

	$("#modalMainFormTitle").text("Add New Job Vacancy");
	$("#modalMainForm").modal("show");
};

const showEditEntryModal = async (id, readOnly = false) => {
	// get entry data from db and show in the form
	const response = await Request.send("/api/job_application_reviews", "GET", {
		data: { id: id },
	});
	const entry = response.data;
	tempData.selectedEntry = entry;

	loadEntry(entry);

	$("#modalMainFormTitle").text("Job Application");

	// if (tempData.selectedEntry.applied) {
	// 	$("#btnApply").attr("disabled", true);
	// } else {
	// 	$("#btnApply").attr("disabled", false);
	// }

	$("#modalMainForm").modal("show");
};

const loadEntry = (entry) => {
	Object.keys(entry.jobVacancy).forEach((k) => {
		$(`#jv${k}`).text(entry.jobVacancy[k]);
	});
	$("#jvdepartment").text(entry.jobVacancy.department.name);
	$("#jvvacancyStatus").text(entry.jobVacancy.jobVacancyStatus.name);
	$("#jvcategory").text(entry.jobVacancy.jobCategory.name);

	Object.keys(entry.candidateProfile).forEach((k) => {
		$(`#cp${k}`).text(entry.candidateProfile[k]);
	});

	$("#candidateProfileReviewStatus").text(
		entry.candidateProfile.candidateProfileReviewStatus.name
	);

	$("#cpnicProof").html(
		`<a href="http://localhost:3000/uploads/${entry.candidateProfile.nicFilename}" target="_blank">View</a>`
	);

	$("#cpphotoPreview").attr(
		"src",
		`http://localhost:3000/uploads/${entry.candidateProfile.photoFilename}`
	);

	const tableHTML =
		"<table class='table table-bordered'><thead><tr><th>Name</th><th>Score</th><th>Proof</th></tr></thead><tbody><tbody></table>";

	$("#listEduQualifications").html(tableHTML);
	$("#listProQualifications").html(tableHTML);
	$("#listExperiences").html(tableHTML);

	$("#listEduQualifications").hide();
	$("#listProQualifications").hide();
	$("#listExperiences").hide();

	entry.candidateProfile.candidateQualifications.forEach((q) => {
		let target;
		if (q.qualificationType.name == "Educational") {
			target = "#listEduQualifications";
			$("#listEduQualifications").show();
		} else if (q.qualificationType.name == "Professional") {
			target = "#listProQualifications";
			$("#listProQualifications").show();
		} else {
			target = "#listExperiences";
			$("#listExperiences").show();
		}

		const row = `<tr>
			<td>${q.name}</td>
			<td>${q.score}</td>
			<td><a href="http://localhost:3000/uploads/${q.filename}" target="_blank">View</a></td>
		<tr>`;

		$(`${target} tbody`).append(row);
	});
};

/*-------------------------------------------------------------------------------------------------------
                                            Operations
-------------------------------------------------------------------------------------------------------*/
const submitApplication = async () => {
	const confirmation = await mainWindow.showConfirmModal(
		"Conformation",
		"Do you really want to apply for this vacancy?"
	);

	if (!confirmation) return;

	// get response
	const response = await Request.send("/api/job_application_reviews", "POST", {
		data: {
			jobVacancyId: tempData.selectedEntry.id,
		},
	});

	// show output modal based on response
	if (response.status) {
		reloadModule();
		$("#modalMainForm").modal("hide");
		mainWindow.showOutputToast("Success!", response.msg);
		mainWindow.showOutputModal("Success!", response.msg);
	}
};

// TODO: finish if i get a chance
// delete entry from the database
// const retractApplication = async (id) => {
// 	const confirmation = await mainWindow.showConfirmModal(
// 		"Confirmation",
// 		"Do you really need to delete this entry?"
// 	);

// 	if (confirmation) {
// 		const response = await Request.send("/api/job_vacancies", "DELETE", {
// 			data: { id: id },
// 		});
// 		if (response.status) {
// 			reloadModule();
// 			$("#modalMainForm").modal("hide");
// 			mainWindow.showOutputToast("Success!", response.msg);
// 		}
// 	}
// };
