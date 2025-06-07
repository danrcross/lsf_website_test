$(document).ready(function () {
  var members = []; // This should be populated with the search results

  $("#arch-dnld-btn").click(function (e) {
    e.preventDefault(); // prevent the default anchor action

    const myQuery = {
      columns: [
        "LSF_Number",
        "First_Name",
        "Last_Name",
        "City",
        "State",
        "Country",
        "SAP_Level_1",
        "SAP_Level_2",
        "SAP_Level_3",
        "SAP_Level_4",
        "SAP_Level_5",
        "eSAP_Level_1",
        "eSAP_Level_2",
        "eSAP_Level_3",
        "eSAP_Level_4",
        "eSAP_Level_5",
      ],
      filters: {}, // if you want ALL members, ensure no filters are applied
      limit: 99999, // set a high limit to fetch all members
      sortColumn: "id",
      sortOrder: "ASC",
    };

    $.ajax({
      url: "queries/query.php",
      type: "POST",
      data: {
        limit: myQuery.limit,
        columns: myQuery.columns,
        filterVals: myQuery.filters,
        sortColumn: myQuery.sortColumn,
        sortOrder: myQuery.sortOrder,
      },
      dataType: "json",
      success: function (response) {
        if (response.status === "success" && response.members.length > 0) {
          downloadPDF(response.members);
        } else {
          alert("No data found.");
        }
      },
      error: function () {
        alert("Server error. Please try again.");
      },
    });
  });

  $(document).on("click", "#downloadPDFBtn", function () {
    downloadPDF(members);
  });

  function downloadPDF(results) {
    if (!results || results.length === 0) {
      alert("No results to download.");
      return;
    }

    // Determine the number of columns from the first result
    const colCount = Object.keys(results[0]).length;

    // Set parameters to calculate dynamic page width:
    const widthPerColumn = 25; // in mm; adjust as needed
    const margin = 40; // total horizontal margin in mm
    // Compute the page width based on number of columns:
    let computedWidth = colCount * widthPerColumn + margin;
    // Clamp the computed width between a minimum and maximum value:
    computedWidth = Math.max(297, Math.min(680, computedWidth));

    // Fixed height for the page (you can adjust this if needed)
    const fixedHeight = 210;

    // Create a new jsPDF document using landscape mode.
    // The format is provided as an array: [pageWidth, pageHeight]
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape", "mm", [computedWidth, fixedHeight]);

    // Extract column headers for table generation.
    const columns = Object.keys(results[0]).map((key) => ({
      header: key,
      dataKey: key,
    }));

    // Generate the table using jsPDF-AutoTable.
    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: results.map((row) => columns.map((col) => row[col.dataKey])),
      startY: 20, // leave some space at the top
      margin: { horizontal: 10 },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 90, 130] },
      theme: "grid",
    });

    // Optionally add a title at the top of the PDF.
    doc.text("Search Results", 14, 12);
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    const filename = `LSF_Members_${mm}_${dd}_${yyyy}.pdf`;

    doc.save(filename);
  }
});
