/*-------------------------------------------------------------------------------------------------------
                                            General
-------------------------------------------------------------------------------------------------------*/

async function loadModule(permissionStr) {
	// get regexes for validation and store on window
	const response = await Request.send("/api/regexes", "GET", {
		data: { module: "CANDIDATE_PROFILE_REVIEW" },
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
				Name: entry.shortName,
				NIC: entry.nic,
				Mobile: entry.mobile,
				ModifiedDate: entry.ModifiedDate,
				"Review Status": entry.candidateProfileReviewStatus.name,
				Review: `<button class="btn btn-success btn-sm" onclick="showEditEntryModal('${entry.id}')"><i class="glyphicon glyphicon-eye-open" aria-hidden="true"></i> Review</button>`,
			};
		});
	};

	window.mainTable = new DataTable(
		"mainTableHolder",
		"/api/candidate_profile_reviews",
		permission,
		dataBuilderFunction,
		"Job Vacancies List"
	);

	loadFormDropdowns();
}

const loadFormDropdowns = async () => {
	const response = await Request.send(
		"/api/general?data[table]=candidate_profile_review_status",
		"GET"
	);
	const reviewStatuses = response.data;

	$("#candidateProfileReviewStatusId").empty();

	reviewStatuses.forEach((s) => {
		$("#candidateProfileReviewStatusId").append(
			`<option value="${s.id}">${s.name}</option>`
		);
	});
};

/*-------------------------------------------------------------------------------------------------------
                                            Modals
-------------------------------------------------------------------------------------------------------*/

const showEditEntryModal = async (id) => {
	const response = await Request.send("/api/candidate_profile_reviews", "GET", {
		data: { id },
	});

	const entry = response.data;

	if (!entry) return;

	// fill form
	Object.keys(entry).forEach((key) => {
		$(`#${key}`).val(entry[key]);
	});

	$("#nicProof").html(
		`<a href="http://localhost:3000/uploads/${entry.nicFilename}" target="_blank">View</a>`
	);

	$("#photoFilename").val(entry.photoFilename);
	$("#photoPreview").attr(
		"src",
		`http://localhost:3000/uploads/${entry.photoFilename}`
	);

	entry.candidateQualifications.forEach((q) => {
		if (q.qualificationType.name == "Educational") {
			$("#listEduQualifications").append(`
			<div class="row">
			<div class="col-xs-6">
				<div class="form-group has-feedback">
					<label>Name:</label>
					<br/>
					<span>${q.name}"</span>
				</div>
			</div>
		
			<div class="col-xs-3">
				<div class="form-group has-feedback">
					<label>Image / Proof:</label>
					<br/>
					<a href="http://localhost:3000/uploads/${q.filename}" target="_blank">View</a>
				</div>
			</div>

	
			<div class="col-xs-3">
				<div class="form-group has-feedback">
					<label>Score:</label>
					<br/>
					<input type="number" data-qid="${q.id}" placeholder="5"/>
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
					<br/>
					<span>${q.name}"</span>
				</div>
			</div>
		
			<div class="col-xs-3">
				<div class="form-group has-feedback">
					<label>Image / Proof:</label>
					<br/>
					<a href="http://localhost:3000/uploads/${q.filename}" target="_blank">View</a>
				</div>
			</div>

	
			<div class="col-xs-3">
				<div class="form-group has-feedback">
					<label>Score:</label>
					<br/>
					<input type="number" data-qid="${q.id}" placeholder="5"/>
				</div>
			</div>

		</div>
			`);
		} else {
			$("#listProQualifications").append(`
			<div class="row">
			<div class="col-xs-6">
				<div class="form-group has-feedback">
					<label>Name:</label>
					<br/>
					<span>${q.name}"</span>
				</div>
			</div>
		
			<div class="col-xs-3">
				<div class="form-group has-feedback">
					<label>Image / Proof:</label>
					<br/>
					<a href="http://localhost:3000/uploads/${q.filename}" target="_blank">View</a>
				</div>
			</div>

	
			<div class="col-xs-3">
				<div class="form-group has-feedback">
					<label>Score:</label>
					<br/>
					<input type="number" data-qid="${q.id}" placeholder="5"/>
				</div>
			</div>

		</div>
			`);
		}
	});

	FormUtil.selectDropdownOptionByValue(
		"candidateProfileReviewStatusId",
		response.data.candidateProfileReviewStatusId || 1
	);
	$("#modalMainFormTitle").text(`Candidate Profile of ${entry.shortName}`);
	$("#modalMainForm").modal("show");
};
