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
				"Job Application": entry.jobApplication.code,
				Vacancy: entry.jobApplication.jobVacancy.code,
				Date: moment(entry.dateTime).format("YYYY-MM-DD"),
				Time: moment(entry.dateTime).format("hh:mm A"),
				"Interview Status": entry.interviewStatus.name,
				View: `<button class="btn btn-success btn-sm" onclick="showEditEntryModal('${entry.id}', true)"><i class="glyphicon glyphicon-eye-open" aria-hidden="true"></i> View</button>`,
				Evaluate:
					entry.interviewStatus.name == "Pending"
						? `<button class="btn btn-primary btn-sm" onclick="showEditEntryModal('${entry.id}')"><i class="glyphicon glyphicon-eye-open" aria-hidden="true"></i> Evaluate</button>`
						: "",
			};
		});
	};

	window.mainTable = new DataTable(
		"mainTableHolder",
		"/api/interviews",
		permission,
		dataBuilderFunction,
		"Job Applications List"
	);

	$("#btnEvaluate").click((e) => {
		e.preventDefault();
		evaluateCandidate();
	});

	// init datetime picker
	$("#idateTime").datetimepicker();

	loadFormDropdowns();

	$("#eInterviewScore").on("change keyup", (e) => {
		let score = e.target.value;
		if (isNaN(score) || score.trim() == "") score = 0;

		if (score < 0) {
			e.target.value = 0;
			score = 0;
		}

		if (score > 10) {
			e.target.value = 10;
			score = 10;
		}

		const candidateProfileScore = $("#ecandidateProfileReviewScore").text();
		const total =
			((parseInt(candidateProfileScore) + parseInt(score)) / 110) * 100;

		$("#efinalScore").text(Math.round(total) + "%");
	});

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
	mainTable.reload();
};

const loadFormDropdowns = async () => {
	const response = await Request.send(
		"/api/general?data[table]=interview_status",
		"GET"
	);
	const interviewStatuses = response.data;

	$("#einterviewStatusId").empty();

	interviewStatuses.forEach((s) => {
		$("#einterviewStatusId").append(
			`<option value="${s.id}">${s.name}</option>`
		);
	});
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
	const response = await Request.send("/api/interviews", "GET", {
		data: { id: id },
	});
	const entry = response.data;
	tempData.selectedEntry = entry;

	loadEntry(entry);

	$("#modalMainFormTitle").text("Interview");

	if (readOnly) {
		$("#btnEvaluate").hide();
		$("#eInterviewScore").attr("disabled", true);
	} else {
		$("#btnEvaluate").show();
		$("#eInterviewScore").attr("disabled", false);
	}

	$("#modalMainForm").modal("show");
};

const loadEntry = (entry) => {
	const jobVacancy = entry.jobApplication.jobVacancy;
	const candidateProfile = entry.jobApplication.candidateProfile;

	Object.keys(jobVacancy).forEach((k) => {
		$(`#jv${k}`).text(jobVacancy[k]);
	});
	$("#jvdepartment").text(jobVacancy.department.name);
	$("#jvvacancyStatus").text(jobVacancy.jobVacancyStatus.name);
	$("#jvcategory").text(jobVacancy.jobCategory.name);

	Object.keys(candidateProfile).forEach((k) => {
		$(`#cp${k}`).text(candidateProfile[k]);
	});

	$("#candidateProfileReviewStatus").text(
		candidateProfile.candidateProfileReviewStatus.name
	);

	$("#cpnicProof").html(
		`<a href="http://localhost:3000/uploads/${candidateProfile.nicFilename}" target="_blank">View</a>`
	);

	$("#cpphotoPreview").attr(
		"src",
		`http://localhost:3000/uploads/${candidateProfile.photoFilename}`
	);

	const tableHTML =
		"<table class='table table-bordered'><thead><tr><th>Name</th><th>Score</th><th>Proof</th></tr></thead><tbody><tbody></table>";

	$("#listEduQualifications").html(tableHTML);
	$("#listProQualifications").html(tableHTML);
	$("#listExperiences").html(tableHTML);

	$("#listEduQualifications").hide();
	$("#listProQualifications").hide();
	$("#listExperiences").hide();

	candidateProfile.candidateQualifications.forEach((q) => {
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

	$("#ecandidateProfileReviewScore").text(candidateProfile.reviewScore + "%");

	$("#efinalScore").text(entry.finalScore + "%");
	$("#eInterviewScore").val(entry.interviewScore);

	FormUtil.selectDropdownOptionByValue(
		"einterviewStatusId",
		entry.interviewStatus.id
	);
};

/*-------------------------------------------------------------------------------------------------------
                                            Operations
-------------------------------------------------------------------------------------------------------*/
const evaluateCandidate = async () => {
	let finalScore = $("#efinalScore").text();
	finalScore = finalScore.slice(0, -1);
	const interviewStatusId = $("#einterviewStatusId").val();

	if (isNaN(finalScore)) {
		mainWindow.showOutputModal("Error", "Please enter interview score.");
		return;
	}

	const confirmation = await mainWindow.showConfirmModal(
		"Conformation",
		"Do you want to evaluate this candidate?"
	);

	if (!confirmation) return;

	const data = {
		id: tempData.selectedEntry.id,
		finalScore,
		interviewStatusId,
	};

	// get response
	const response = await Request.send("/api/interviews", "PUT", {
		data: data,
	});

	// show output modal based on response
	if (response.status) {
		reloadModule();
		$("#modalMainForm").modal("hide");
		mainWindow.showOutputToast("Success!", response.msg);
		mainWindow.showOutputModal("Success!", response.msg);
	}
};
