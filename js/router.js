// load routes
const loadRoute = (route, optionParams = "") => {
	let routes = getRoutes();

	// if route doesn't exist
	if (!routes[route]) {
		window.alert("This route doesnt exist (404)");
		window.location = "/index.html?page=dashboard";
		return;
	}

	const frame = $("#iframeMain")[0];
	frame.contentWindow.location.replace(routes[route].path + optionParams);

	// hide open modals
	$(".modal").modal("hide");

	// scroll to top
	$("html, body").animate({ scrollTop: 0 }, "slow");

	// change url
	history.pushState({}, null, `?page=${route}`);
};

// handle iframe src changing
const updateRouteInfo = () => {
	const path =
		document.getElementById("iframeMain").contentWindow.location.href;

	// handle non authenticated cases
	if (path.indexOf("noauth.html") > -1) {
		window.location = "../login.html";
		return;
	}

	// get route params
	const urlParams = new URLSearchParams(window.location.search);
	const page = urlParams.get("page");

	// proceed with title update
	let routes = getRoutes();
	$("#txtNavbarTitle").text(routes[page].title);

	// public data for iframe access
	const mainWindowData = {
		showOutputModal,
		showConfirmModal,
		showOutputToast,
		showViewModal,
		tempData,
		loadRoute,
	};

	// make modal functions available inside the iframeMain
	const iframeWindow = document.getElementById("iframeMain").contentWindow;
	iframeWindow.mainWindow = mainWindowData;

	// if location is dashboard, update tile visibility
	if (page == "dashboard") {
		iframeWindow.updateTiles();
	}

	// set permissions for forms and other components inside iframe
	if (iframeWindow.loadModule) {
		const moduleName = page.toUpperCase().trim();
		const permission = tempData.privileges[moduleName];
		iframeWindow.loadModule(permission);
	}
};

const getRoutes = () => {
	return {
		dashboard: {
			title: "Dashboard",
			path: "/pages/dashboard/dashboard.html",
		},
		user: {
			title: "User View",
			path: "/pages/user/user.html",
		},
		privilege: {
			title: "Privileges View",
			path: "/pages/privilege/privilege.html",
		},
		role: {
			title: "Role View",
			path: "/pages/role/role.html",
		},
		profile: {
			title: "Profile View",
			path: "/pages/profile/profile.html",
		},
		candidate_profile: {
			title: "Candidate Profile View",
			path: "/pages/candidate_profile/candidate_profile.html",
		},
		job_category: {
			title: "Job Category View",
			path: "/pages/job_category/job_category.html",
		},
		department: {
			title: "Department View",
			path: "/pages/department/department.html",
		},
		job_vacancy: {
			title: "Job Vacancy",
			path: "/pages/job_vacancy/job_vacancy.html",
		},
		candidate_profile_review: {
			title: "Candidate Profile Review",
			path: "/pages/candidate_profile_review/candidate_profile_review.html",
		},
		noauth: {
			title: "Auth Failure",
			path: "/pages/noauth.html",
		},
	};
};
