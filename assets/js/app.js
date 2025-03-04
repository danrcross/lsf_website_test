$(document).ready(function () {
  // stores the current limit value (for pagination, from local storage??)
  var curLimit = null;
  var curPage = 1;
  var numPgs = 0;
  var membersLength = 0;
  let columns = [];
  var allMembers = [];
  var curPgMembers = [];

  $("#select-all").on("click", function () {
    console.log("triggered");
    $('input[data-col="col-select"]').prop("checked", this.checked);
  });

  // Checkbox functionality for AMA search
  // $("#noAMANumber").change(function () {
  //   if (this.checked) {
  //     $("#AMASearchInput").addClass("hidden"); // Hide search bar
  //   } else {
  //     $("#AMASearchInput").removeClass("hidden"); // Show search bar
  //   }
  // });

  $("#searchBtn").click(function () {
    allMembers = [];
    columns = [];
    filters = [];
    let limit = $("#limitInput").val();

    // Loop through each checkbox and, if checked, push the "name" attribute to the columns array
    $('input[data-col="col-select"]').each(function () {
      if ($(this).is(":checked")) {
        columns.push($(this).attr("name"));
      }
    });

    function getFilterValues() {
      let filterVals = {
        SAPAspFilt: $("#filt-SAP-Asp").val(),
        eSAPAspFilt: $("#filt-eSAP-Asp").val(),
        deceasedFilt: $("#filt-Deceased").val(),
        dupFilt: $("#filt-Duplicate").val(),
        hiSAPFilt: $("#filt-hi-SAP").val(),
        hiESAPFilt: $("#filt-hi-eSAP").val(),
        // AMANumFilt: $("#filt-AMA-Num").val(),
      };
      console.log(filterVals);
      return filterVals;
    }
    var filterVals = getFilterValues();

    // Send a request to the server for the data
    $.ajax({
      url: "query.php",
      type: "POST",
      data: {
        limit: limit,
        columns: columns,
        filterVals: filterVals,
      },
      dataType: "json",
      success: function (response) {
        if (response.status === "success" && response.members.length > 0) {
          membersLength = response.members.length;
          curPage = 1;
          numPgs = Math.floor((membersLength - 1) / 25) + 1;
          localStorage.setItem("members", JSON.stringify(response.members));
          allMembers = response.members;
          curPgMembers = allMembers.slice(0, 25);
          curLimit = limit;
          renderMembers(curPgMembers, columns);
        } else {
          $("#results").html("<p>Error: " + response.message + "</p>");
        }
      },
      error: function () {
        $("#results").html("<p>Server error. Please try again.</p>");
      },
    });
  });

  function renderPagination(pgNum) {
    // (Pagination rendering can be added here if needed)
  }

  function renderMembers(members, columns) {
    console.log(members);
    // Initialize the output with a table and table header
    let output = "<table border='1'><thead><tr>";

    // If no columns were selected, use the default column list based on your new schema
    if (columns.length === 0) {
      columns = [
        "id",
        "LSF_Number",
        "First_Name",
        "Last_Name",
        "Address",
        "City",
        "State",
        "Zip",
        "Country",
        "Country_Coordinator",
        "email",
        "Last_Contact",
        "AMA_Number",
        "SAP_Aspirant",
        "SAP_Level_1",
        "SAP_Level_2",
        "SAP_Level_3",
        "SAP_Level_4",
        "SAP_Level_5",
        "eSAP_Aspirant",
        "eSAP_Level_1",
        "eSAP_Level_2",
        "eSAP_Level_3",
        "eSAP_Level_4",
        "eSAP_Level_5",
        "SAP_Level", // computed column (updated name)
        "eSAP_Level", // computed column (updated name)
        "Miscellaneous",
        "Deceased",
        "Duplicate",
      ];
    }

    // Add table headers dynamically based on the columns
    columns.forEach((column) => {
      output += `<th>${column}</th>`;
    });
    output += "</tr></thead><tbody>";

    // Loop through each member and create a table row
    members.forEach((member) => {
      output += "<tr>";
      // Loop through the selected columns and dynamically append their values
      columns.forEach((column) => {
        // Append the cell value or an empty cell if the property is missing
        if (member[column]) {
          output += `<td>${member[column]}</td>`;
        } else {
          output += "<td></td>";
        }
      });
      output += "</tr>";
    });

    output += "</tbody></table>";

    // Insert the generated output into the results container
    $("#results").html(output);

    if (membersLength > 25) {
      $("#pagination").html(
        `<button id="prev-pg">Previous</button> <span id="cur-pg-slct"></span> <button id="next-pg">Next</button>`
      );
      $("#cur-pg-slct").html(`<select id="pg-dd"></select>`);
      for (let i = 1; i <= numPgs; i++) {
        $("#pg-dd").append(`<option value="${i}">${i}</option>`);
      }
    }

    $("#next-pg").click(function () {
      console.log(numPgs);
      if (curPage > 0 && curPage < numPgs) {
        if (membersLength > 25) {
          curPage++;
          curPgMembers = allMembers.slice((curPage - 1) * 25, curPage * 25);
          renderMembers(curPgMembers, columns);
          $("#pg-dd").val(curPage);
        } else {
          console.log("No more members to display");
        }
      } else {
        console.log("No more members to display");
      }
    });

    $("#prev-pg").click(function () {
      if (membersLength > 25 && curPage > 1) {
        curPage--;
        curPgMembers = allMembers.slice((curPage - 1) * 25, curPage * 25);
        renderMembers(curPgMembers, columns);
        $("#pg-dd").val(curPage);
      } else {
        console.log("No more members to display");
      }
    });

    $("#pg-dd").change(function () {
      curPage = parseInt($(this).val());
      curPgMembers = allMembers.slice((curPage - 1) * 25, curPage * 25);
      renderMembers(curPgMembers, columns);
      $("#pg-dd").val(curPage);
    });
  }
});
