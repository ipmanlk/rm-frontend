const tempData = {
	selectedEntry: null,
};
/*-------------------------------------------------------------------------------------------------------
                                            General
-------------------------------------------------------------------------------------------------------*/

async function loadModule(permissionStr) {
	// create an array from permission string
	const permission = permissionStr.split("").map((p) => parseInt(p));

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
			};
		});
	};

	window.mainTable = new DataTable(
		"mainTableHolder",
		"/api/candidate_interviews",
		permission,
		dataBuilderFunction,
		"Candidate Interviews List"
	);

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
	const response = await Request.send("/api/candidate_interviews", "GET", {
		data: { id: id },
	});
	const entry = response.data;

	loadEntry(entry);

	$("#modalMainFormTitle").text("Interview Details");

	$("#modalMainForm").modal("show");
};

const loadEntry = (entry) => {
	const jobVacancy = entry.jobApplication.jobVacancy;

	Object.keys(jobVacancy).forEach((k) => {
		$(`#jv${k}`).text(jobVacancy[k]);
	});
	$("#jvdepartment").text(jobVacancy.department.name);
	$("#jvvacancyStatus").text(jobVacancy.jobVacancyStatus.name);
	$("#jvcategory").text(jobVacancy.jobCategory.name);

	$("#icode").text(entry.code);
	$("#idate").text(moment(entry.dateTime).format("YYYY-MM-DD"));
	$("#itime").text(moment(entry.dateTime).format("hh:mm A"));
	$("#ilocation").text(entry.location);
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

const scheduleInterview = async () => {
	const datetimeStr = $("#idateTime").val().trim();

	if (datetimeStr === "") {
		mainWindow.showOutputModal("Error", "Please select a date and time first.");
		return;
	}

	const today = new Date();
	const interviewDate = new Date(datetimeStr);

	if (today >= interviewDate) {
		mainWindow.showOutputModal(
			"Error",
			"Interview date must be in the future."
		);
		return;
	}

	const location = $("#ilocation").val().trim();
	if (location === "") {
		mainWindow.showOutputModal(
			"Error",
			"Please provide a valid interview location."
		);
		return;
	}

	const data = {
		jobApplicationId: tempData.selectedEntry.id,
		jobApplicationStatusName: "Accepted",
		interviewDateTime: datetimeStr,
		location: location,
	};

	const response = await Request.send("/api/job_application_reviews", "PUT", {
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

const rejectApplication = async () => {
	const confirmation = await mainWindow.showConfirmModal(
		"Confirmation",
		"Do you really want to reject this application?"
	);

	if (!confirmation) return;

	const data = {
		jobApplicationId: tempData.selectedEntry.id,
		jobApplicationStatusName: "Rejected",
	};

	const response = await Request.send("/api/job_application_reviews", "PUT", {
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
