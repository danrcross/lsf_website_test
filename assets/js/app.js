$(document).ready(function () {
  // stores the current limit value (for pagination, from local storage??)
  var curLimit = null;
  $("#select-all").on("click", function () {
    console.log("triggered");
    $('input[data-col="col-select"]').prop("checked", this.checked);
  });
  $("#searchBtn").click(function () {
    let limit = $("#limitInput").val();
    let columns = [];

    //Loop thru each checkbox and check if it is checked
    $('input[data-col="col-select"]').each(function () {
      // for each checkbox checked, push the "name" attribute to the 'columns' array
      if ($(this).is(":checked")) {
        columns.push($(this).attr("name"));
      }
    });

    console.log(columns);
    // sends a request to the server for the data
    $.ajax({
      url: "query.php",
      type: "POST",
      // sends the limit value to the server
      data: {
        limit: limit,
        columns: columns,
      },
      dataType: "json",
      success: function (response) {
        // if the server responds with success, render the data
        if (response.status === "success") {
          console.log("success" + JSON.stringify(response.members));
          // calls the renderMembers function to render the data
          curLimit = limit;
          renderMembers(response.members, columns);
        } else {
          $("#results").html("<p>Error: " + response.message + "</p>");
        }
      },
      error: function () {
        $("#results").html("<p>Server error. Please try again.</p>");
      },
    });
  });

  $("#next-pg").click(function () {
    console.log(curLimit);
  });

  function renderMembers(members, columns) {
    // Initialize the output with an unordered list
    let output = "<ul>";
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
    // Loop through each member
    members.forEach((member) => {
      // Start each list item
      let memberOutput = "<li>";

      // Loop through the selected columns and dynamically append their values
      columns.forEach((column) => {
        // Check if the column exists in the member object and append it to the output
        if (member[column]) {
          memberOutput += `${column}: ${member[column]}, `;
        }
      });

      // Remove the trailing comma and space, then close the list item
      memberOutput = memberOutput.slice(0, -2) + "</li>";

      // Append the member's output to the overall list
      output += memberOutput;
    });

    // Close the unordered list
    output += "</ul>";

    // Insert the generated output into the results container
    $("#results").html(output);
  }
});
