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
				Name: entry.title,
				Position: entry.position,
				Department: entry.department.name,
				Category: entry.jobCategory.name,
				Applied: entry.applied ? "Yes" : "No",
				View: `<button class="btn btn-success btn-sm" onclick="showEditEntryModal('${entry.id}', true)"><i class="glyphicon glyphicon-eye-open" aria-hidden="true"></i> View</button>`,
			};
		});
	};

	window.mainTable = new DataTable(
		"mainTableHolder",
		"/api/job_applications",
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
	const response = await Request.send("/api/job_applications", "GET", {
		data: { id: id },
	});
	const entry = response.data;
	tempData.selectedEntry = entry;

	mainForm.loadEntry(entry);

	if (readOnly) {
		mainForm.enableReadOnly();
		$("#modalMainFormTitle").text("View Job Vacancy");
	} else {
		mainForm.disableReadOnly();
		$("#modalMainFormTitle").text("Edit Job Vacancy");
	}

	if (tempData.selectedEntry.applied) {
		$("#btnApply").attr("disabled", true);
	} else {
		$("#btnApply").attr("disabled", false);
	}

	$("#modalMainForm").modal("show");
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
	const response = await Request.send("/api/job_applications", "POST", {
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
