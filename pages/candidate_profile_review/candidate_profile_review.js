const tempData = {};

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
				"Modified Date": entry.modifiedDate,
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

	$("#btnUpdateProfile").click(updateCandidateProfile);
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

const updateEventListeners = () => {
	$(".qua-score").off();

	$(".qua-score").on("change keyup", (e) => {
		const targetVal = $(e.target).val() || 0;

		if (targetVal === 0) {
			$(e.target).val(0);
		} else if (targetVal > 10) {
			$(e.target).val(10);
		} else if (targetVal < 0) {
			$(e.target).val(0);
		}

		let total = 0;
		let count = 0;
		$(".qua-score").each((index, el) => {
			const value = $(el).val() || 0;
			if (value === 0) return;
			total += parseInt(value);
			count += 1;
		});

		const perc = (total / (count * 10)) * 100;

		$("#reviewScore").val(Math.round(perc).toString() + "%");
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

	$("#reviewScore").val(entry.reviewScore + "%");

	$("#nicProof").html(
		`<a href="http://localhost:3000/uploads/${entry.nicFilename}" target="_blank">View</a>`
	);

	$("#photoFilename").val(entry.photoFilename);
	$("#photoPreview").attr(
		"src",
		`http://localhost:3000/uploads/${entry.photoFilename}`
	);

	$("#listEduQualifications").parent().hide();
	$("#listProQualifications").parent().hide();
	$("#listExperiences").parent().hide();

	$("#listEduQualifications").empty();
	$("#listProQualifications").empty();
	$("#listExperiences").empty();

	entry.candidateQualifications.forEach((q) => {
		if (q.qualificationType.name == "Educational") {
			$("#listEduQualifications").append(`
			<div class="row">
			<div class="col-xs-6">
				<div class="form-group has-feedback">
					<label>Name:</label>
					<br/>
					<span>${q.name}</span>
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
					<input type="number" class="qua-score" data-qid="${q.id}" placeholder="5" min="0" max="10" value="${q.score}"/>
				</div>
			</div>

		</div>
			`);
			$("#listEduQualifications").parent().show();
		} else if (q.qualificationType.name == "Professional") {
			$("#listProQualifications").append(`
			<div class="row">
			<div class="col-xs-6">
				<div class="form-group has-feedback">
					<label>Name:</label>
					<br/>
					<span>${q.name}</span>
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
					<input type="number" class="qua-score" data-qid="${q.id}" placeholder="5" min="0" max="10" value="${q.score}"/>
				</div>
			</div>

		</div>
			`);

			$("#listProQualifications").parent().show();
		} else {
			$("#listExperiences").append(`
			<div class="row">
			<div class="col-xs-6">
				<div class="form-group has-feedback">
					<label>Name:</label>
					<br/>
					<span>${q.name}</span>
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
					<input type="number" class="qua-score" data-qid="${q.id}" placeholder="5" min="0" max="10" value="${q.score}"/>
				</div>
			</div>

		</div>
			`);

			$("#listExperiences").parent().show();
		}
	});

	FormUtil.selectDropdownOptionByValue(
		"candidateProfileReviewStatusId",
		response.data.candidateProfileReviewStatusId || 1
	);
	$("#modalMainFormTitle").text(`Candidate Profile of ${entry.shortName}`);
	$("#modalMainForm").modal("show");

	tempData.selectedEntry = entry;

	updateEventListeners();
};

/*-------------------------------------------------------------------------------------------------------
                                            Operations
-------------------------------------------------------------------------------------------------------*/
const updateCandidateProfile = async () => {
	const candidateProfileId = tempData.selectedEntry.id;
	const qualificationScores = getQualificationScores();
	const candidateProfileReviewStatusId = $(
		"#candidateProfileReviewStatusId"
	).val();

	const data = {
		candidateProfileId,
		qualificationScores,
		candidateProfileReviewStatusId,
	};

	const response = await Request.send("/api/candidate_profile_reviews", "PUT", {
		data: data,
	});

	mainTable.reload();
	$("#modalMainForm").modal("hide");

	if (response.status) {
		mainWindow.showOutputToast("Success!", response.msg);
	}
};

const getQualificationScores = () => {
	const qualificationSelectors = {
		"#listEduQualifications": "Educational",
		"#listProQualifications": "Professional",
		"#listExperiences": "Experience",
	};

	const qScores = [];

	for (const selector of Object.keys(qualificationSelectors)) {
		for (const row of $(selector).children(".row").toArray()) {
			const numInput = $(row).find("input[type='number']").first();
			const id = parseInt(numInput.data("qid"));
			const score = parseInt(numInput.val());

			qScores.push({ id, score });
		}
	}

	return qScores;
};
