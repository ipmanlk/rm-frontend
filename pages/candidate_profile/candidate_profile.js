/*-------------------------------------------------------------------------------------------------------
                                            General
-------------------------------------------------------------------------------------------------------*/

async function loadModule(permissionStr) {
	// get regexes for validation and store on window tempData
	const response = await Request.send("/api/regexes", "GET", {
		data: { module: "ROLE" },
	});

	const validationInfo = response.data;

	// create an array from permission string
	const permission = permissionStr.split("").map((p) => parseInt(p));
}

/*-------------------------------------------------------------------------------------------------------
                                            Modals
-------------------------------------------------------------------------------------------------------*/

const showNewEntryModal = () => {
	$("#modalMainFormTitle").text("Add New Role");
	$("#modalMainForm").modal("show");
};

const showEditEntryModal = async (id, readOnly = false) => {
	if (readOnly) {
		$("#modalMainFormTitle").text("View Role");
	} else {
		$("#modalMainFormTitle").text("Edit Role");
	}

	$("#modalMainForm").modal("show");
};

/*-------------------------------------------------------------------------------------------------------
                                            Operations
-------------------------------------------------------------------------------------------------------*/
// add new entry to the database
const addEntry = async () => {};

// update entry in the database
const updateEntry = async () => {};
