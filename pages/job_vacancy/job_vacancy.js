/*-------------------------------------------------------------------------------------------------------
                                            General
-------------------------------------------------------------------------------------------------------*/

async function loadModule(permissionStr) {
	// get regexes for validation and store on window tempData
	const response = await Request.send("/api/regexes", "GET", {
		data: { module: "JOB_VACANCY" },
	});

	const validationInfo = response.data;

	// create an array from permission string
	const permission = permissionStr.split("").map((p) => parseInt(p));

	if (permission[0] == 0) {
		$("#btnTopAddEntry").hide();
	}

	// load main table
	const dataBuilderFunction = (responseData) => {
		// parse resposne data and return in data table frendly format
		return responseData.map((entry) => {
			return {
				ID: entry.id,
				Name: entry.title,
				Position: entry.position,
				Department: entry.department.name,
				Category: entry.jobCategory.name,
				Status: entry.jobVacancyStatus.name,
				View: `<button class="btn btn-success btn-sm" onclick="showEditEntryModal('${entry.id}', true)"><i class="glyphicon glyphicon-eye-open" aria-hidden="true"></i> View</button>`,
				Edit: `<button class="btn btn-warning btn-sm" onclick="showEditEntryModal('${entry.id}')"><i class="glyphicon glyphicon-edit" aria-hidden="true"></i> Edit</button>`,
				Delete: `${
					entry.jobVacancyStatus.name == "Deleted"
						? '<button style="display:none">Delete</button>'
						: `<button class="btn btn-danger btn-sm" onclick="deleteEntry('${entry.id}')"><i class="glyphicon glyphicon-edit" aria-hidden="true"></i> Delete</button>`
				}`,
			};
		});
	};

	window.mainTable = new DataTable(
		"mainTableHolder",
		"/api/job_vacancies",
		permission,
		dataBuilderFunction,
		"Job Vacancies List"
	);

	// load main from
	window.mainForm = new Form(
		"mainForm",
		"Job Vacancy Details",
		permission,
		validationInfo,
		[
			{ id: "departmentId", route: "/api/departments" },
			{ id: "jobCategoryId", route: "/api/job_categories" },
			{
				id: "jobVacancyStatusId",
				route: "/api/general?data[table]=job_vacancy_status",
				statusField: true,
			},
		],
		{
			addEntry: addEntry,
			deleteEntry: deleteEntry,
			updateEntry: updateEntry,
		}
	);

	// event listeners for top action buttons
	$("#btnTopAddEntry").on("click", () => {
		showNewEntryModal();
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
	const response = await Request.send("/api/job_vacancies", "GET", {
		data: { id: id },
	});
	const entry = response.data;

	mainForm.loadEntry(entry);

	if (readOnly) {
		mainForm.enableReadOnly();
		$("#modalMainFormTitle").text("View Job Vacancy");
	} else {
		mainForm.disableReadOnly();
		$("#modalMainFormTitle").text("Edit Job Vacancy");
	}

	$("#modalMainForm").modal("show");
};

/*-------------------------------------------------------------------------------------------------------
                                            Operations
-------------------------------------------------------------------------------------------------------*/
// add new entry to the database
const addEntry = async () => {
	const { status, data } = await mainForm.validateForm();

	// if there are errors
	if (!status) {
		mainWindow.showOutputModal("Sorry!. Please fix these errors.", data);
		return;
	}

	// get response
	const response = await Request.send("/api/job_vacancies", "POST", {
		data: data,
	});

	// show output modal based on response
	if (response.status) {
		reloadModule();
		$("#modalMainForm").modal("hide");
		mainWindow.showOutputToast("Success!", response.msg);
		mainWindow.showOutputModal(
			"New Job Vacancy Added!",
			`<h4>ID: ${response.data.id}</h4>`
		);
	}
};

// update entry in the database
const updateEntry = async () => {
	const { status, data } = await mainForm.validateForm();

	// if there are errors
	if (!status) {
		mainWindow.showOutputModal("Sorry!. Please fix these errors.", data);
		return;
	}

	const newEntryObj = data;
	const dataHasChanged = await mainForm.hasDataChanged();

	// if nothing has been modifed
	if (!dataHasChanged) {
		mainWindow.showOutputModal(
			"Sorry!.",
			"You haven't changed anything to update."
		);
		return;
	}

	// set id of the newEntry object
	newEntryObj.id = mainForm.selectedEntry.id;

	// send put reqeust to update data
	const response = await Request.send("/api/job_vacancies", "PUT", {
		data: newEntryObj,
	});

	// show output modal based on response
	if (response.status) {
		reloadModule();
		$("#modalMainForm").modal("hide");
		mainWindow.showOutputToast("Success!", response.msg);
	}
};

// delete entry from the database
const deleteEntry = async (id) => {
	const confirmation = await mainWindow.showConfirmModal(
		"Confirmation",
		"Do you really need to delete this entry?"
	);

	if (confirmation) {
		const response = await Request.send("/api/job_vacancies", "DELETE", {
			data: { id: id },
		});
		if (response.status) {
			reloadModule();
			$("#modalMainForm").modal("hide");
			mainWindow.showOutputToast("Success!", response.msg);
		}
	}
};
