const tempData = {
	employeeProfile: null,
};

/*-------------------------------------------------------------------------------------------------------
                                            General
-------------------------------------------------------------------------------------------------------*/

async function loadModule(permissionStr) {
	// get regexes for validation and store on window tempData
	const response = await Request.send("/api/regexes", "GET", {
		data: { module: "EMPLOYEE" },
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
				Username: entry.user.username,
				Name: entry.shortName,
				View: `<button class="btn btn-success btn-sm" onclick="showEditEntryModal('${entry.id}', true)"><i class="glyphicon glyphicon-eye-open" aria-hidden="true"></i> View</button>`,
				Edit: `<button class="btn btn-warning btn-sm" onclick="showEditEntryModal('${entry.id}')"><i class="glyphicon glyphicon-edit" aria-hidden="true"></i> Edit</button>`,
				Delete: `${
					entry.employeeStatus.name == "Deleted"
						? '<button style="display:none">Delete</button>'
						: `<button class="btn btn-danger btn-sm" onclick="deleteEntry('${entry.id}')"><i class="glyphicon glyphicon-edit" aria-hidden="true"></i> Delete</button>`
				}`,
			};
		});
	};

	window.mainTable = new DataTable(
		"mainTableHolder",
		"/api/employees",
		permission,
		dataBuilderFunction,
		"Employees List"
	);

	$("input[type='button'], button").on("click", (e) => {
		e.preventDefault();
	});

	$("#btnAddToEduList").click((e) => {
		addToEducationList();
	});

	$("#btnAddToProList").click((e) => {
		addToProList();
	});

	$("#btnAddToExpList").click((e) => {
		addToExpList();
	});

	$("#btnTopAddEntry").on("click", () => {
		showNewEntryModal();
	});

	$(".btnFmAdd, .btnFmUpdate").click((e) => {
		updateEmployee().catch((e) => {
			console.log(e);
		});
	});

	$("#photo").on("change", () => {
		if (photo.files && photo.files[0]) {
			$("#photoPreview").attr("src", URL.createObjectURL(photo.files[0]));
		}
	});

	loadFormDropdowns().catch((e) => {
		console.log(e);
	});
}

const showNewEntryModal = () => {
	$(".btnFmAdd, .btnFmUpdate").hide();
	$(".btnFmAdd").show();

	// set date of adding
	$("#mainForm #addedDate").val(new Date().today());

	$("#modalMainFormTitle").text("Add New Employee");
	$("#modalMainForm").modal("show");
};

const showEditEntryModal = async (id, readOnly = false) => {
	await loadProfile(id).catch((e) => {
		console.log(e);
	});

	$(".btnFmAdd, .btnFmUpdate").hide();

	if (readOnly) {
		$("#mainForm").addClass("read-only");
		$("#modalMainFormTitle").text("View Employee");
	} else {
		$("#mainForm").removeClass("read-only");
		$("#modalMainFormTitle").text("Edit Employee");
		$(".btnFmUpdate").show();
	}

	$("#modalMainForm").modal("show");
};

/*-------------------------------------------------------------------------------------------------------
                                           Handle form interactions
-------------------------------------------------------------------------------------------------------*/
const updateFormListeners = () => {
	$(".btn-remove-from-list").off();
	$(".btn-remove-from-list").click((e) => {
		removeFromList(e);
	});

	$(".proof").off();
	$(".proof").on("change", (e) => {
		registerFilename(e);
	});
};

const addToEducationList = () => {
	$("#listEduQualifications").append(`
	<div class="row">
	<div class="col-xs-6">
		<div class="form-group has-feedback">
			<label>Name:</label>
			<input type="text" class="form-control title" placeholder="Qualification name"/>
		</div>
	</div>

	<div class="col-xs-5">
		<div class="form-group has-feedback">
			<label>Image / Proof:</label>
			<input type="file" class="form-control proof" />
		</div>
	</div>

	<div style="display: none">
		<div class="form-group has-feedback">
			<label>Filename:</label>
			<input type="text" class="form-control filename" disabled/>
		</div>
	</div>

	<div class="col-xs-1">
		<div class="form-group" style="float: right">
			<label style="color: white">button</label>
			<input
				type="button"
				class="btn btn-danger btn-remove-from-list"
				style="display: block"
				value="x"
			/>
		</div>
	</div>
</div>
	`);

	updateFormListeners();
};

const addToProList = () => {
	$("#listProQualifications").append(`
	<div class="row">
	<div class="col-xs-6">
		<div class="form-group has-feedback">
			<label>Name:</label>
			<input type="text" class="form-control title" placeholder="Qualification name"/>
		</div>
	</div>

	<div class="col-xs-5">
		<div class="form-group has-feedback">
			<label>Image / Proof:</label>
			<input type="file" class="form-control proof" />
		</div>
	</div>

	<div style="display: none">
		<div class="form-group has-feedback">
			<label>Filename:</label>
			<input type="text" class="form-control filename" disabled/>
		</div>
	</div>

	<div class="col-xs-1">
		<div class="form-group" style="float: right">
			<label style="color: white">button</label>
			<input
				type="button"
				class="btn btn-danger btn-remove-from-list"
				style="display: block"
				value="x"
			/>
		</div>
	</div>
</div>
	`);

	updateFormListeners();
};

const addToExpList = () => {
	$("#listExperiences").append(`
	<div class="row">
	<div class="col-xs-6">
		<div class="form-group has-feedback">
			<label>Title:</label>
			<input type="text" class="form-control title" placeholder="Experience title"/>
		</div>
	</div>

	<div class="col-xs-5">
		<div class="form-group has-feedback">
			<label>Image / Proof:</label>
			<input type="file" class="form-control proof" />
		</div>
	</div>

	<div style="display: none">
		<div class="form-group has-feedback">
			<label>Filename:</label>
			<input type="text" class="form-control filename" disabled/>
		</div>
	</div>

	<div class="col-xs-1">
		<div class="form-group" style="float: right">
			<label style="color: white">button</label>
			<input
				type="button"
				class="btn btn-danger btn-remove-from-list"
				style="display: block"
				value="x"
			/>
		</div>
	</div>
</div>
	`);

	updateFormListeners();
};

const removeFromList = (event) => {
	$(event.target).parent().parent().parent().remove();
	updateFormListeners();
};

const registerFilename = (event) => {
	const root = $(event.target).parent().parent().parent();

	const fileInput = root.find(".proof").first();
	const filenameInput = root.find(".filename").first();

	if (fileInput && filenameInput && fileInput[0].files[0]) {
		filenameInput.val(fileInput[0].files[0].name);
	}
};

const loadFormDropdowns = async () => {
	// define needed attributes
	let employee_status, users, response;

	// get data from the api for each dropbox

	response = await Request.send(
		"/api/general?data[table]=employee_status",
		"GET"
	);
	employee_status = response.data;

	response = await Request.send("/api/users?limit=0", "GET");
	users = response.data;

	// clean existing options and append new data
	$("#employeeStatusId").empty();
	$("#userId").empty();

	employee_status.forEach((s) => {
		$("#employeeStatusId").append(`<option value="${s.id}">${s.name}</option>`);
	});

	users.forEach((u) => {
		$("#userId").append(
			`<option value="${u.id}">${u.username} (${u.id})</option>`
		);
	});

	// init bootstrap-select
	$("#userId").selectpicker();
};

/*-------------------------------------------------------------------------------------------------------
                                            Operations
-------------------------------------------------------------------------------------------------------*/

const loadProfile = async (id) => {
	const response = await Request.send("/api/employees", "GET", {
		data: { id },
	});

	const entry = response.data;

	if (!entry) return;

	tempData.employeeProfile = entry;

	$("#userId").selectpicker("val", entry.userId);

	FormUtil.selectDropdownOptionByValue(
		"employeeStatusId",
		entry.employeeStatusId
	);

	// fill form
	Object.keys(entry).forEach((key) => {
		$(`#${key}`).val(entry[key]);
	});

	$("#nicFilename").val(entry.nicFilename);
	$("#photoFilename").val(entry.photoFilename);
	$("#photoPreview").attr(
		"src",
		`http://localhost:3000/uploads/${entry.photoFilename}`
	);

	entry.employeeQualifications.forEach((q) => {
		if (q.qualificationType.name == "Educational") {
			$("#listEduQualifications").append(`
			<div class="row">
			<div class="col-xs-6">
				<div class="form-group has-feedback">
					<label>Name:</label>
					<input type="text" class="form-control title" placeholder="Qualification name" value="${q.name}"/>
				</div>
			</div>
		
			<div class="col-xs-5">
				<div class="form-group has-feedback">
					<label>Image / Proof:</label>
					<input type="file" class="form-control proof" />
				</div>
			</div>
		
			<div style="display: none">
				<div class="form-group has-feedback">
					<label>Filename:</label>
					<input type="text" class="form-control filename" value="${q.filename}" disabled/>
				</div>
			</div>
		
			<div class="col-xs-1">
				<div class="form-group" style="float: right">
					<label style="color: white">button</label>
					<input
						type="button"
						class="btn btn-danger btn-remove-from-list"
						style="display: block"
						value="x"
					/>
				</div>
			</div>
		</div>
			`);
		} else if (q.qualificationType.name == "Professional") {
			$("#listProQualifications").append(`
			<div class="row">
			<div class="col-xs-6">
				<div class="form-group has-feedback">
					<label>Name:</label>
					<input type="text" class="form-control title" placeholder="Qualification name" value="${q.name}"/>
				</div>
			</div>
		
			<div class="col-xs-5">
				<div class="form-group has-feedback">
					<label>Image / Proof:</label>
					<input type="file" class="form-control proof" />
				</div>
			</div>
		
			<div style="display: none">
				<div class="form-group has-feedback">
					<label>Filename:</label>
					<input type="text" class="form-control filename" value="${q.filename}" disabled/>
				</div>
			</div>
		
			<div class="col-xs-1">
				<div class="form-group" style="float: right">
					<label style="color: white">button</label>
					<input
						type="button"
						class="btn btn-danger btn-remove-from-list"
						style="display: block"
						value="x"
					/>
				</div>
			</div>
		</div>
			`);
		} else {
			$("#listExperiences").append(`
			<div class="row">
			<div class="col-xs-6">
				<div class="form-group has-feedback">
					<label>Title:</label>
					<input type="text" class="form-control title" placeholder="Experience title" value="${q.name}"/>
				</div>
			</div>
		
			<div class="col-xs-5">
				<div class="form-group has-feedback">
					<label>Image / Proof:</label>
					<input type="file" class="form-control proof" />
				</div>
			</div>
		
			<div style="display: none">
				<div class="form-group has-feedback">
					<label>Filename:</label>
					<input type="text" class="form-control filename" value="${q.filename}" disabled/>
				</div>
			</div>
		
			<div class="col-xs-1">
				<div class="form-group" style="float: right">
					<label style="color: white">button</label>
					<input
						type="button"
						class="btn btn-danger btn-remove-from-list"
						style="display: block"
						value="x"
					/>
				</div>
			</div>
		</div>
			`);
		}
	});

	updateFormListeners();
};

const updateEmployee = async () => {
	const userId = $("#userId").val();
	const photoFilename = photo.files[0]
		? (await Request.sendFileUploadRequest(photo.files[0])).filename
		: $("#photoFilename").val();
	const shortName = $("#shortName").val();
	const fullName = $("#fullName").val();
	const mobile = $("#mobile").val();
	const land = $("#land").val();
	const address = $("#address").val();
	const nic = $("#nic").val();
	const nicFilename = fileNIC.files[0]
		? (await Request.sendFileUploadRequest(fileNIC.files[0])).filename
		: $("#nicFilename").val();

	const employeeStatusId = $("#employeeStatusId").val();
	const qualifications = await getQualifications();

	const data = {
		userId,
		photoFilename,
		shortName,
		fullName,
		mobile,
		land,
		address,
		nic,
		nicFilename,
		qualifications,
		employeeStatusId,
	};

	if (tempData.employeeProfile) {
		data.id = tempData.employeeProfile.id;
	}

	const response = await Request.send("/api/employees", "PUT", {
		data: data,
	});

	if (response.status) {
		mainWindow.showOutputToast("Success!", response.msg);
	}
};

const getQualifications = async () => {
	const qualificationSelectors = {
		"#listEduQualifications": "Educational",
		"#listProQualifications": "Professional",
		"#listExperiences": "Experience",
	};

	const qualifications = [];

	for (const selector of Object.keys(qualificationSelectors)) {
		for (const row of $(selector).children(".row").toArray()) {
			const titleElem = $(row).find(".title").first();
			const fileElem = $(row).find(".proof").first();
			const filenameElem = $(row).find(".filename").first();
			const name = (titleElem.val() || titleElem.text()).trim();

			let filename;

			if (fileElem[0] && fileElem[0].files[0]) {
				filename = (await Request.sendFileUploadRequest(fileElem[0].files[0]))
					.filename;
			} else if (tempData.employeeProfile != null && filenameElem) {
				filename = $(filenameElem).val();
			} else {
				continue;
			}

			const qualification = {
				name,
				filename,
				qualificationTypeName: qualificationSelectors[selector],
			};

			if (
				tempData.employeeProfile &&
				tempData.employeeProfile.employeeQualifications
			) {
				const result = tempData.employeeProfile.employeeQualifications.find(
					(p) => p.filename == filename
				);

				if (result) {
					qualification.id = result.id;
				}
			}

			qualifications.push(qualification);
		}
	}

	return qualifications;
};
