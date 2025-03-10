$(document).ready(function () {
  // Event listener for tabs at top of page
  $("#tabs").tabs();
  // Object to store query parameters
  let myQuery = {
    columns: [],
    filters: {},
    limit: 10,
    sortColumn: "id",
    sortOrder: "ASC",
    perPage: 10,
    page: 1,
  };
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
          // Add "Reset Filters" button
          filterContainer.append(`
                  <div class="reset-container">
                      <button id="resetFilters">Reset Filters</button>
                  </div>
              `);
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
      },
    });
  }
  // Handle the "Reset Filters" button click
  $(document).on("click", "#resetFilters", function () {
    // Clear all text inputs
    $("input[id^='filt-']").val("");

    // Reset all dropdowns to "All"
    $("select[id^='filt-']").val("All");
  });

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
    return filterVals;
  }
  // Render sort options
  function renderSort(members) {
    let columns = Object.keys(members.length ? members[0] : {});
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
  }
  // Handle sort options: stores the selected sort column and order into the myQuery object
  $(document).on("change", "#sort, #order", function () {
    myQuery.sortColumn = $("#sort").val();
    myQuery.sortOrder = $("#order").val();
  });
  // Render members in a table
  function renderMembers(members) {
    let output = `
      <div class="table-container">
        <table>
          <thead>
            <tr>
    `;

    // Check if the members array is empty; if it is, return an empty table
    let columns = Object.keys(members.length ? members[0] : {});

    // Table headers
    columns.forEach((column) => {
      output += `<th>${column.replace(/_/g, " ")}</th>`;
    });

    output += `
            </tr>
          </thead>
          <tbody class="scrollable-tbody">
    `;

    // Table rows
    members.forEach((member) => {
      output += "<tr>";
      columns.forEach((column) => {
        output += `<td>${member[column] || ""}</td>`;
      });
      output += "</tr>";
    });

    output += `
          </tbody>
        </table>
      </div>
    `;

    $("#results").html(output);
  }

  function createPages(members) {
    let totalResults = members.length;
    let perPage = myQuery.perPage;
    perPage = parseInt(perPage) || 10; // Default per page if not provided
    let totalPages = Math.ceil(totalResults / perPage);

    let paginatedData = {
      totalResults: totalResults,
      perPage: perPage,
      totalPages: totalPages,
      pages: {}, // Object to store each page separately
    };

    // Split members into pages
    for (let i = 0; i < totalPages; i++) {
      let start = i * perPage;
      paginatedData.pages[i + 1] = members.slice(start, start + perPage);
    }

    // Save paginated data to localStorage
    localStorage.setItem("paginatedMembers", JSON.stringify(paginatedData));
  }

  function renderPagination() {
    let paginatedData = JSON.parse(localStorage.getItem("paginatedMembers"));
    if (!paginatedData) return;

    let { totalPages } = paginatedData;
    let currentPage = myQuery.page || 1;

    let paginationHTML = `
        <div class="pagination-controls">
            <button id="prevPage" ${
              currentPage === 1 ? "disabled" : ""
            }>Previous</button>
            <select id="pageSelect">
                ${Array.from(
                  { length: totalPages },
                  (_, i) =>
                    `<option value="${i + 1}" ${
                      i + 1 === currentPage ? "selected" : ""
                    }>
                        Page ${i + 1} of ${totalPages}
                    </option>`
                ).join("")}
            </select>
            <button id="nextPage" ${
              currentPage === totalPages ? "disabled" : ""
            }>Next</button>
        </div>
    `;

    $("#pagination").html(paginationHTML);
  }

  // Update the page with new data, based on the current page number
  function updatePage() {
    let paginatedData = JSON.parse(localStorage.getItem("paginatedMembers"));
    let pageData = paginatedData.pages[myQuery.page] || [];

    renderMembers(pageData);
    renderPagination();
  }
  // Handle the search button click
  $("#searchBtn").click(function () {
    // Collect selected columns
    let selectedColumns = [];
    $('input[data-col="col-select"]').each(function () {
      if ($(this).is(":checked")) {
        selectedColumns.push($(this).attr("name"));
      }
    });
    // update myQuery object with the selected columns
    myQuery = {
      columns: selectedColumns,
      filters: getFilterValues(),
      limit: $("#limitInput").val(),
      perPage: $("#perPageInput").val(),
      sortColumn: "id",
      sortOrder: "ASC",
    };
    console.log(myQuery);

    $.ajax({
      url: "query.php",
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
          createPages(response.members);
          myQuery.page = 1; // Reset to page 1 on new search
          updatePage(); // Load first page and pagination controls
          renderSort(response.members);
        } else {
          $("#results").html("<p>No results found.</p>");
        }
      },

      error: function () {
        $("#results").html("<p>Server error. Please try again.</p>");
      },
    });
  });

  // Handle pagination button clicks
  $(document).on("click", "#prevPage", function () {
    if (myQuery.page > 1) {
      myQuery.page--;
      updatePage();
    }
  });

  $(document).on("click", "#nextPage", function () {
    let paginatedData = JSON.parse(localStorage.getItem("paginatedMembers"));
    if (myQuery.page < paginatedData.totalPages) {
      myQuery.page++;
      updatePage();
    }
  });

  $(document).on("change", "#pageSelect", function () {
    myQuery.page = parseInt($(this).val());
    updatePage();
  });

  function sortData({ limit, columns, filters, sortColumn, sortOrder }) {
    $.ajax({
      url: "query.php",
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
          createPages(response.members);
          myQuery.page = 1; // Reset to page 1 on new search
          updatePage(); // Load first page and pagination controls
        } else {
          $("#results").html("<p>No results found.</p>");
        }
      },
      error: function () {
        $("#results").html("<p>Server error. Please try again.</p>");
      },
    });
  }

  $(document).on("click", "#sortBtn", function () {
    sortData(myQuery);
  });

  // Fetch columns and filters on page load
  fetchColumns();
  fetchFilters();
});
