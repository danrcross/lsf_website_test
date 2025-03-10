$(document).ready(function () {
  // Test render_sort.php

  function sortData() {
    $.ajax({
      url: "queries/render_sort.php",
      type: "GET",
      dataType: "json",
      success: function (response) {
        console.log(response.testResponse);
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
      },
    });
  }
  // Fetch and render columns dynamically
  function fetchColumns() {
    $.ajax({
      url: "queries/render_columns.php",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.status === "success") {
          let columns = response.columns;
          let container = $("#col-sel-ctnr");

          // Clear existing checkboxes
          container.empty();

          // Create "Select All" checkbox
          container.append(`
                        <div class="checkbox-item">
                            <label for="select-all">
                                Select all
                                <input type="checkbox" id="select-all" />
                            </label>
                        </div>
                    `);

          // Loop through columns and create checkboxes dynamically
          columns.forEach((column) => {
            let checkboxHTML = `
                            <div class="checkbox-item">
                                <label for="${column}">
                                    ${column.replace(/_/g, " ")}
                                    <input type="checkbox" name="${column}" id="cb-col-${column}" data-col="col-select" />
                                </label>
                            </div>
                        `;
            container.append(checkboxHTML);
          });

          // "Select All" functionality
          $("#select-all").change(function () {
            $("input[data-col='col-select']").prop("checked", this.checked);
          });
        } else {
          console.error("Error fetching columns:", response.message);
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
      },
    });
  }

  // Fetch and render filters dynamically
  function fetchFilters() {
    $.ajax({
      url: "queries/render_filters.php",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.status === "success") {
          let filterOptions = response.filterOptions;
          let filterContainer = $("#fil-sch-ctnr");

          filterContainer.empty();
          // Loop through filter options and create inputs/dropdowns dynamically
          Object.keys(filterOptions).forEach((filterKey) => {
            // Check if filter data is an array or object
            let filterData = filterOptions[filterKey];
            let filterHtml = "";
            // checks if the filterData is an array, if it is, it creates a dropdown  with the values in the array
            if (Array.isArray(filterData)) {
              // Dropdowns with user-friendly labels
              let optionsHtml = filterData
                .map((value) => `<option value="${value}">${value}</option>`)

                .join("");

              filterHtml = `
                                <div class="filt-item">
                                    <label>${filterKey.replace(
                                      /_/g,
                                      " "
                                    )}:</label>
                                    <select id="filt-${filterKey}">
                                        ${optionsHtml}
                                    </select>
                                </div>
                            `;
            } else {
              // Search input fields
              filterHtml = `
                                <div class="filt-item">
                                    <label>${filterKey.replace(
                                      /_/g,
                                      " "
                                    )}:</label>
                                    <input type="text" id="filt-${filterKey}" placeholder="Search ${filterKey.replace(
                /_/g,
                " "
              )}">
                                </div>
                            `;
            }

            filterContainer.append(filterHtml);
          });
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
      },
    });
  }

  // Collect filter values from UI
  function getFilterValues() {
    let filterVals = {};

    // Collect search inputs
    $("input[id^='filt-']").each(function () {
      let key = $(this).attr("id").replace("filt-", "");
      let value = $(this).val().trim();
      if (value) {
        filterVals[key] = value;
      }
    });

    // Collect dropdown values
    $("select[id^='filt-']").each(function () {
      let key = $(this).attr("id").replace("filt-", "");
      let value = $(this).val();
      if (value !== "All") {
        filterVals[key] = value;
      }
    });

    console.log("Collected Filters:", filterVals);
    return filterVals;
  }
  // Render sort options
  function renderSort(columns) {
    let sortContainer = $("#sortOptions");
    sortContainer.empty();
    sortContainer.append(`
                <label for="sort">Sort by:</label>
                  <select id="sort">
                    ${columns.map((column) => {
                      return `<option value="${column}">${column.replace(
                        /_/g,
                        " "
                      )}</option>`;
                    })}
                  </select>
                  <select id="order">
                    <option value="ASC">Ascending</option>
                    <option value="DESC">Descending</option>
                  </select>
                  <button id="sortBtn">Sort</button>
            `);
    columns.forEach((column) => {
      console.log(column);
    });
  }
  // Render members in a table
  function renderMembers(members) {
    // creates a table for the members array
    let output = "<table border='1'><thead><tr>";
    // checks if the members array is empty; if it is, it returns an empty table; if it is not, it returns a the names of the columns as the table headers
    let columns = Object.keys(members.length ? members[0] : {});
    renderSort(columns);
    // Table headers
    columns.forEach((column) => {
      output += `<th>${column.replace(/_/g, " ")}</th>`;
    });
    output += "</tr></thead><tbody>";

    // Table rows
    members.forEach((member) => {
      output += "<tr>";
      columns.forEach((column) => {
        output += `<td>${member[column] || ""}</td>`;
      });
      output += "</tr>";
    });

    output += "</tbody></table>";
    $("#results").html(output);
  }

  // Handle the search button click
  $("#searchBtn").click(function () {
    let columns = [];
    let limit = $("#limitInput").val();
    let filterVals = getFilterValues();

    // Collect selected columns
    $('input[data-col="col-select"]').each(function () {
      if ($(this).is(":checked")) {
        columns.push($(this).attr("name"));
      }
    });

    console.log("Sending to query.php:", {
      limit: limit,
      columns: columns,
      filterVals: filterVals,
    });

    $.ajax({
      url: "query.php",
      type: "POST",
      data: { limit: limit, columns: columns, filterVals: filterVals },
      dataType: "json",
      success: function (response) {
        console.log("Query Results:", response);
        if (response.status === "success" && response.members.length > 0) {
          renderMembers(response.members);
        } else {
          $("#results").html("<p>No results found.</p>");
        }
      },
      error: function () {
        $("#results").html("<p>Server error. Please try again.</p>");
      },
    });
  });

  // Fetch columns and filters on page load
  fetchColumns();
  fetchFilters();
  sortData();
});
