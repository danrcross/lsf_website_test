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

  $("#searchBtn").click(function () {
    allMembers = [];
    columns = [];
    filters = [];
    let limit = $("#limitInput").val();

    //Loop thru each checkbox and check if it is checked
    $('input[data-col="col-select"]').each(function () {
      // for each checkbox checked, push the "name" attribute to the 'columns' array
      if ($(this).is(":checked")) {
        columns.push($(this).attr("name"));
      }
    });

    function getFilterValues() {
      let filterVals = {
        hiSAPFilt: $("#filt-hi-SAP").val(),
        hiESAPFilt: $("#filt-hi-eSAP").val(),
      };
      console.log(filterVals);
      return filterVals;
    }
    var filterVals = getFilterValues();

    // $('select[data-filt="filt-select"]').each(function () {
    //   filters.push($(this).find(":selected").text());
    // });

    // console.log(filters);

    // sends a request to the server for the data
    $.ajax({
      url: "query.php",
      type: "POST",
      // sends the limit value to the server
      data: {
        limit: limit,
        columns: columns,
        filterVals: filterVals,
      },
      dataType: "json",
      success: function (response) {
        // if the server responds with success, render the data
        if (response.status === "success" && response.members.length > 0) {
          membersLength = response.members.length;
          curPage = 1;
          numPgs = Math.floor((membersLength - 1) / 25) + 1;
          localStorage.setItem("members", JSON.stringify(response.members));
          allMembers = response.members;
          curPgMembers = allMembers.slice(0, 25);
          curLimit = limit;
          // calls the renderMembers function to render the data
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
  function renderPagination(pgNum) {}
  function renderMembers(members, columns) {
    console.log(members);
    // Initialize the output with a table and table header
    let output = "<table border='1'><thead><tr>";

    if (columns.length === 0) {
      columns = [
        "id",
        "LSF_Number",
        "First_name",
        "Last_name",
        "City",
        "State",
        "Country",
        "SAPLevel1",
        "SAPLevel2",
        "SAPLevel3",
        "SAPLevel4",
        "SAPLevel5",
        "eSAPLevel1",
        "eSAPLevel2",
        "eSAPLevel3",
        "eSAPLevel4",
        "eSAPLevel5",
        "Deceased",
        "Duplicate",
        "email",
        "HighestSAPAchievement",
        "HighestESAPAchievement",
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
        // Check if the column exists in the member object and append it to the table cell
        if (member[column]) {
          output += `<td>${member[column]}</td>`;
        } else {
          output += "<td></td>"; // If no value, add an empty cell
        }
      });

      output += "</tr>";
    });

    // Close the table and tbody
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
