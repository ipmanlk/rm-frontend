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

	$("#btnUpdateProfile").click((e) => {
		updateProfile().catch((e) => {
			console.log(e);
		});
	});
}

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

/*-------------------------------------------------------------------------------------------------------
                                            Operations
-------------------------------------------------------------------------------------------------------*/

const updateProfile = async () => {
	const photoFilename = (await Request.sendFileUploadRequest(photo.files[0]))
		.filename;

	const shortName = $("#shortName").val();
	const fullName = $("#fullName").val();
	const mobile = $("#mobile").val();
	const land = $("#land").val();
	const address = $("#address").val();
	const nic = $("#nic").val();

	const nicFilename = (await Request.sendFileUploadRequest(fileNIC.files[0]))
		.filename;

	const qualifications = await getQualifications();

	console.log(
		photoFilename,
		shortName,
		fullName,
		mobile,
		land,
		address,
		nic,
		nicFilename,
		qualifications
	);
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
			const title = (titleElem.val() || titleElem.text()).trim();

			if (fileElem.attr("type") == "file") {
				if (!fileElem[0].files[0]) continue;
				filename = (await Request.sendFileUploadRequest(fileElem[0].files[0]))
					.filename;
			} else {
				filename = fileElem.val();
			}

			qualifications.push({
				title,
				filename,
				qualificationTypeName: qualificationSelectors[selector],
			});
		}
	}

	return qualifications;
};
