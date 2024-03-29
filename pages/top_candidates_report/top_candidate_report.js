function loadModule(permissionStr) {
	$("#btnViewReport").click((e) => {
		e.preventDefault();
		showReport();
	});
}

const showReport = async () => {
	const limit = $("#txtRecordLimit").val();

	if (isNaN(limit)) {
		mainWindow.showOutputToast(
			"Error!",
			"Please provide a valid record limit."
		);
		return;
	}

	const response = await Request.send("/api/reports/top_candidates", "GET", {
		data: { limit: limit },
	});

	if (!response.status) return;

	let tableHead = `
    <table class="table table-bordered">
    <thead>
      <tr>
        <th>Candidate Code</th>
        <th>Candidate Name</th>
        <th>Review Score</th>
        <th>Review Date</th>
        <th>Reviewed By</th>
      </tr>
    </thead>
  
  `;

	// generate table rows
	let rows = "";

	for (const i of response.data) {
		rows += `
      <tr>
        <td>${i.code}</td>
        <td>${i.shortName}</td>
        <td>${i.reviewScore}</td>
        <td>${i.reviewDate}</td>
        <td>${i.employee.code}</td>
      </tr>
    
    `;
	}

	const table = `
    ${tableHead}
    <tbody>
      ${rows}
    </tbody>
    </table>
  `;

	$("#output").html(table);

	// generate chart
	showCharts(response.data);
};

const showCharts = (data) => {
	/* 
  Show Sales Chart 
  */
	// get canvas for displaying chart
	const ctx = document.getElementById("barChart");

	if (window.barChartObj) window.barChartObj.destroy();
	$("#barChart").empty();

	const barChartOptions = {
		type: "bar",
		data: {
			labels: data.map((i) => i.code),
			datasets: [
				{
					label: "Candidates",
					data: data.map((i) => i.reviewScore),
					backgroundColor: "rgb(54, 162, 235, 0.6)",
					borderWidth: 1,
				},
			],
		},
		options: {
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: true,
						},
						scaleLabel: {
							display: true,
							labelString: "Review Score",
						},
					},
				],
				xAxes: [
					{
						scaleLabel: {
							display: true,
							labelString: "Candidate",
						},
					},
				],
			},
		},
	};

	// create chart object
	window.barChartObj = new Chart(ctx, barChartOptions);
};
