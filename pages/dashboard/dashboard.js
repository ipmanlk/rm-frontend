// colors for tiles
const colors = [
	"#2e8bcc",
	"#339933",
	"#e51400",
	"#7b4f9d",
	"#9b59b6",
	"#d35400",
	"#c0392b",
	"#00aba9",
];

// tile info
const tileInfo = {
	USER: { title: "User", icon: "fa-users" },
	PRIVILEGE: { title: "Privilege", icon: "fa-lock" },
	ROLE: { title: "Role", icon: "fa-user-circle" },
	CANDIDATE_PROFILE: { title: "Candidate Profile", icon: "fa-user-circle" },
	JOB_CATEGORY: { title: "Job Category", icon: "fa-user-circle" },
	DEPARTMENT: { title: "Department", icon: "fa-user-circle" },
	JOB_VACANCY: { title: "Job Vacancy", icon: "fa-user-circle" },
	CANDIDATE_PROFILE_REVIEW: {
		title: "Candidate Profile Review",
		icon: "fa-user-circle",
	},
	EMPLOYEE: {
		title: "Employee",
		icon: "fa-user-circle",
	},
	JOB_APPLICATION: {
		title: "Job Application",
		icon: "fa-user-circle",
	},
	JOB_APPLICATION_REVIEW: {
		title: "Job Application Review",
		icon: "fa-user-circle",
	},
	CANDIDATE_INTERVIEW: {
		title: "My Interviews",
		icon: "fa-user-circle",
	},
	INTERVIEW: {
		title: "Interviews",
		icon: "fa-user-circle",
	},
};

$(document).ready(() => {
	// event listener for filtering cards
	$("#txtFilterCards").on("keyup change", (e) => {
		const keyword = e.target.value.trim().toLowerCase();

		// when keyword is empty
		if (keyword.trim() == "") {
			$(".TILE").show();
			return;
		}

		$(".TILE").each((i, tile) => {
			// check h1 text inside tile
			const tileText = $(tile).first().first().first().text().toLowerCase();
			if (tileText.indexOf(keyword) > -1) {
				$(tile).show();
			} else {
				$(tile).hide();
			}
		});
	});
});

// this function will be called from router.js upon loading dashboard
function updateTiles() {
	// show hide tiles based on privileges
	const privileges = mainWindow.tempData.privileges;

	// clear tile list
	$("#tileList").empty();

	// show tiles based on privileges
	Object.keys(privileges).forEach((module, index) => {
		// check if user has read permisison
		if (privileges[module].split("")[1] != 1) {
			return;
		}

		// get random color for tile
		const color = colors[Math.floor(Math.random() * colors.length)];

		try {
			// append tile
			const tile = `
		<div class="card TILE ${module}" style="background-color: ${color}; opacity: 0.8;" onclick="mainWindow.loadRoute('${module.toLowerCase()}')">
				<div class="card-body text-center">
						<h1>${tileInfo[module].title}</h1>
						<i class="fa fa-3x ${tileInfo[module].icon}"></i>
				</div>
		</div>
		`;

			$("#tileList").append(tile);
		} catch (e) {
			return;
		}
	});

	updateSpecialComponents().catch((e) => {
		console.log(e);
	});
}

const updateSpecialComponents = async () => {
	// get the role name sof logged in user
	const userRoles = mainWindow.tempData.profile.userRoles.map((ur) => ur.name);
};

// find if at least one of given array elements are included in an another array
const checkRoles = (userRoles = [], allowedRoles = []) => {
	let isAllowed = false;

	allowedRoles.every((roleName) => {
		if (userRoles.includes(roleName)) {
			isAllowed = true;
			return false;
		}
		return true;
	});

	return isAllowed;
};
