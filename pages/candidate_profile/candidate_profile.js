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

	$("*").on("click", (e) => {
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
}

/*-------------------------------------------------------------------------------------------------------
                                           Handle form interactions
-------------------------------------------------------------------------------------------------------*/
const updateListRemoveButtonListeners = () => {
	$(".btn-remove-from-list").off();
	$(".btn-remove-from-list").click((e) => {
		removeFromList(e);
	});
};

const addToEducationList = () => {
	$("#listEduQualifications").append(`
	<div class="row">
	<div class="col-xs-5">
		<div class="form-group has-feedback">
			<label>Name:</label>
			<input type="text" class="form-control" placeholder="Qualification name"/>
		</div>
	</div>
	<div class="col-xs-5">
		<div class="form-group has-feedback">
			<label>Image / Proof:</label>
			<input type="file" class="form-control" />
		</div>
	</div>
	<div class="col-xs-2">
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

	updateListRemoveButtonListeners();
};

const addToProList = () => {
	$("#listProQualifications").append(`
	<div class="row">
	<div class="col-xs-5">
		<div class="form-group has-feedback">
			<label>Name:</label>
			<input type="text" class="form-control" placeholder="Qualification name"/>
		</div>
	</div>
	<div class="col-xs-5">
		<div class="form-group has-feedback">
			<label>Image / Proof:</label>
			<input type="file" class="form-control" />
		</div>
	</div>
	<div class="col-xs-2">
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

	updateListRemoveButtonListeners();
};

const addToExpList = () => {
	$("#listExperiences").append(`
	<div class="row">
	<div class="col-xs-5">
		<div class="form-group has-feedback">
			<label>Title:</label>
			<input type="text" class="form-control" placeholder="Experience title"/>
		</div>
	</div>
	<div class="col-xs-5">
		<div class="form-group has-feedback">
			<label>Image / Proof:</label>
			<input type="file" class="form-control" />
		</div>
	</div>
	<div class="col-xs-2">
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

	updateListRemoveButtonListeners();
};

const removeFromList = (event) => {
	$(event.target).parent().parent().parent().remove();
	updateListRemoveButtonListeners();
};

const getFormData = () => {};

/*-------------------------------------------------------------------------------------------------------
                                            Operations
-------------------------------------------------------------------------------------------------------*/
