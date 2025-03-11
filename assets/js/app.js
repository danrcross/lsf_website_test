$(document).ready(function () {
  // Event listener for tabs at top of page
  $("#tabs").tabs();

  // for storing data to global variable
  let paginatedData = {
    totalResults: 0,
    perPage: 10,
    totalPages: 0,
    pages: {},
  };

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

  function fetchAddMemberFields() {
    $.ajax({
      url: "queries/render_add_fields.php", // PHP script to fetch column metadata
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.status === "success") {
          let fields = response.fields;
          let formContainer = $("#addMemberForm");

          formContainer.empty(); // Clear existing fields

          const nonEditableFields = ["id", "SAP_Level", "eSAP_Level"]; // Fields to exclude

          // Loop through each field and create appropriate input elements
          fields.forEach((field) => {
            let fieldHtml = "";
            let label = field.name.replace(/_/g, " "); // Clean column names

            // Skip non-editable fields
            if (nonEditableFields.includes(field.name)) return;

            // Ensure "Deceased" and "Duplicate" are dropdowns
            if (field.name === "Deceased" || field.name === "Duplicate") {
              fieldHtml = `
                            <label for="${field.name}">${label}:</label>
                            <select id="${field.name}" name="${field.name}">
                                <option value="">Select</option>
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        `;
            } else if (
              field.type.includes("varchar") ||
              field.type.includes("text")
            ) {
              // Text input (not required)
              fieldHtml = `
                            <label for="${field.name}">${label}:</label>
                            <input type="text" id="${field.name}" name="${field.name}">
                        `;
            } else if (
              field.type.includes("int") &&
              field.name !== "Deceased" &&
              field.name !== "Duplicate"
            ) {
              // Number input (not required)
              fieldHtml = `
                            <label for="${field.name}">${label}:</label>
                            <input type="number" id="${field.name}" name="${field.name}">
                        `;
            } else if (field.type.includes("date")) {
              // Date picker (not required)
              fieldHtml = `
                            <label for="${field.name}">${label}:</label>
                            <input type="date" id="${field.name}" name="${field.name}">
                        `;
            }

            // Append field to the form
            formContainer.append(fieldHtml);
          });

          // Add the submit button
          formContainer.append('<button type="submit">Add Member</button>');
        } else {
          console.error("Error fetching fields:", response.message);
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

      if (key === "Deceased" || key === "Duplicate") {
        if (value === "Yes") {
          filterVals[key] = "1"; // Store as 1
        } else if (value === "No") {
          filterVals[key] = "0"; // Store as 0, to be converted to 0 or NULL in SQL
        }
      } else if (value !== "All") {
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
  // Render members in a table, along with edit, save, and delete buttons
  function renderMembers(members) {
    const nonEditableColumns = ["SAP_Level", "eSAP_Level"]; // Define columns that shouldn't be edited

    let output = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Actions</th> <!-- Move Actions column to the left -->
  `;

    let columns = Object.keys(members.length ? members[0] : {});

    // Table headers
    columns.forEach((column) => {
      output += `<th>${column.replace(/_/g, " ")}</th>`;
    });

    output += `</tr></thead><tbody class="scrollable-tbody">`;

    // Table rows
    members.forEach((member, index) => {
      output += `<tr data-index="${index}">`;

      // Action buttons (Now appearing first)
      output += `
      <td>
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="save-btn" data-index="${index}" style="display: none;">Save</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </td>
    `;

      // Table Data Cells
      columns.forEach((column) => {
        if (column === "id") {
          output += `<td>${member[column]}</td>`; // ID remains static
        } else if (nonEditableColumns.includes(column)) {
          output += `<td>${member[column] ?? ""}</td>`; // Non-editable columns remain as text
        } else {
          output += `<td class="editable" data-column="${column}">${
            member[column] ?? ""
          }</td>`; // Editable columns
        }
      });

      output += `</tr>`;
    });

    output += `</tbody></table></div>`;

    $("#results").html(output);
  }
  // Edit Button Event Handler
  $(document).on("click", ".edit-btn", function () {
    let rowIndex = $(this).data("index");
    let row = $(`tr[data-index="${rowIndex}"]`);
    let saveBtn = row.find(".save-btn");
    let editBtn = row.find(".edit-btn");

    if ($(this).text() === "Edit") {
      // Change editable fields to input boxes
      row.find(".editable").each(function () {
        let text = $(this).text();
        $(this).html(`<input type="text" value="${text}">`);
      });

      // Show Save button and change Edit to Cancel
      saveBtn.show();
      editBtn.text("Cancel");
    } else {
      // Cancel action: restore original values
      row.find(".editable").each(function () {
        let text = $(this).find("input").val();
        $(this).text(text);
      });

      // Hide Save button and revert Edit button
      saveBtn.hide();
      editBtn.text("Edit");
    }
  });

  // Save Button Event Handler
  $(document).on("click", ".save-btn", function () {
    let rowIndex = $(this).data("index");
    let row = $(`tr[data-index="${rowIndex}"]`);
    let editBtn = row.find(".edit-btn");
    let memberId = row.find("td:nth-child(2)").text().trim(); // Ensure correct ID

    if (!memberId) {
      alert("Error: Member ID is missing.");
      return;
    }

    let confirmSave = confirm("Are you sure you want to save the changes?");
    if (!confirmSave) return;

    let rowData = {};

    // Collect new values
    row.find(".editable").each(function () {
      let columnName = $(this).data("column");
      let newValue = $(this).find("input").val() || $(this).text().trim();
      rowData[columnName] = newValue;
    });

    $.ajax({
      url: "queries/edit.php",
      type: "POST",
      data: { data: rowData, id: memberId },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          console.log("Update successful:", response.message);

          //  Update local storage with new values
          let paginatedData = JSON.parse(
            localStorage.getItem("paginatedMembers")
          );
          if (paginatedData) {
            // Find and update the correct member entry
            Object.keys(paginatedData.pages).forEach((page) => {
              paginatedData.pages[page] = paginatedData.pages[page].map(
                (member) =>
                  member.id == memberId ? { ...member, ...rowData } : member
              );
            });

            // Update local storage
            localStorage.setItem(
              "paginatedMembers",
              JSON.stringify(paginatedData)
            );

            //  Refresh the page to show updates
            updatePage();
          }

          // Restore row to normal view mode
          row.find(".editable").each(function () {
            let columnName = $(this).data("column");
            $(this).text(rowData[columnName]); // Replace input field with text
          });

          // Hide Save button and reset Edit button
          row.find(".save-btn").hide();
          editBtn.text("Edit");
        } else {
          console.error("Update failed:", response.message);
          alert("Error: " + response.message);
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
        alert("Failed to save changes. Please try again.");
      },
    });
  });

  // Delete Button Event Handler
  $(document).on("click", ".delete-btn", function () {
    let rowIndex = $(this).data("index");
    let row = $(`tr[data-index="${rowIndex}"]`);
    let memberId = row.find("td:nth-child(2)").text().trim(); // Ensure it gets the correct ID

    if (!memberId) {
      alert("Error: Member ID is missing.");
      return;
    }

    let confirmDelete = confirm("Are you sure you want to delete this member?");
    if (!confirmDelete) return;

    $.ajax({
      url: "queries/delete.php",
      type: "POST",
      data: { id: memberId },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          console.log("Delete successful:", response.message);

          //  Remove row from localStorage data
          let paginatedData = JSON.parse(
            localStorage.getItem("paginatedMembers")
          );
          if (paginatedData) {
            // Remove from the current page dataset
            Object.keys(paginatedData.pages).forEach((page) => {
              paginatedData.pages[page] = paginatedData.pages[page].filter(
                (member) => member.id != memberId
              );
            });

            // Update localStorage
            localStorage.setItem(
              "paginatedMembers",
              JSON.stringify(paginatedData)
            );

            // Refresh the current page
            updatePage();
          }
        } else {
          console.error("Delete failed:", response.message);
          alert("Error: " + response.message);
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
        alert("Failed to delete member. Please try again.");
      },
    });
  });

  function addMember() {
    $("#addMemberForm").submit(function (event) {
      event.preventDefault(); // Prevent default form submission

      // Collect form data
      let formData = {};
      $("#addMemberForm")
        .find("input, select")
        .each(function () {
          let key = $(this).attr("name");
          let value = $(this).val();

          // Convert empty values to null
          if (value === "") value = null;

          // Convert boolean fields to integers (Yes=1, No=0)
          if (key === "Deceased" || key === "Duplicate") {
            value = value === "1" ? 1 : 0;
          }

          formData[key] = value;
        });

      // Send AJAX request
      $.ajax({
        url: "queries/add.php",
        type: "POST",
        data: JSON.stringify(formData),
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
          if (response.success) {
            alert("Member added successfully!");
            $("#addMemberForm")[0].reset(); // Reset form
          } else {
            alert("Error: " + response.message);
          }
        },
        error: function (xhr, status, error) {
          console.error("AJAX Error:", error);
          alert("Failed to add member. Please try again.");
        },
      });
    });
  }

  function createPages(members) {
    let perPage = myQuery.perPage;
    perPage = parseInt(perPage) || 10;
    let totalPages = Math.ceil(members.length / perPage);

    paginatedData = {
      totalResults: members.length,
      perPage: perPage,
      totalPages: totalPages,
      pages: {},
    };

    for (let i = 0; i < totalPages; i++) {
      let start = i * perPage;
      paginatedData.pages[i + 1] = members.slice(start, start + perPage);
    }
  }

  function renderPagination() {
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
    if (!paginatedData.pages) return;

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
    if (myQuery.page < paginatedData.totalPages) {
      myQuery.page++;
      updatePage();
    }
  });

  $(document).on("change", "#pageSelect", function () {
    myQuery.page = parseInt($(this).val());
    updatePage();
  });

  // function not used
  // function sortData({ limit, columns, filters, sortColumn, sortOrder }) {
  //   $.ajax({
  //     url: "query.php",
  //     type: "POST",
  //     data: {
  //       limit,
  //       columns,
  //       filterVals: filters,
  //       sortColumn,
  //       sortOrder,
  //     },
  //     dataType: "json",
  //     success: function (response) {
  //       if (response.status === "success" && response.members.length > 0) {
  //         createPages(response.members);
  //         myQuery.page = 1; // Reset to page 1 on new search
  //         updatePage(); // Load first page and pagination controls
  //       } else {
  //         $("#results").html("<p>No results found.</p>");
  //       }
  //     },
  //     error: function () {
  //       $("#results").html("<p>Server error. Please try again.</p>");
  //     },
  //   });
  // }

  $(document).on("click", "#sortBtn", function () {
    if (!paginatedData || !paginatedData.pages) {
      console.error("No data available for sorting.");
      return;
    }

    let allMembers = Object.values(paginatedData.pages).flat(); // Flatten all pages into a single array
    let sortColumn = $("#sort").val();
    let sortOrder = $("#order").val();

    //  Perform Sorting
    allMembers.sort((a, b) => {
      let valA = a[sortColumn] || "";
      let valB = b[sortColumn] || "";

      if (!isNaN(valA) && !isNaN(valB)) {
        // Numeric Sorting
        valA = Number(valA);
        valB = Number(valB);
      }

      if (sortOrder === "ASC") {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });

    //  Redistribute members back into paginated structure
    let perPage = paginatedData.perPage;
    let totalPages = Math.ceil(allMembers.length / perPage);

    let sortedPaginatedData = {
      totalResults: allMembers.length,
      perPage: perPage,
      totalPages: totalPages,
      pages: {},
    };

    for (let i = 0; i < totalPages; i++) {
      let start = i * perPage;
      sortedPaginatedData.pages[i + 1] = allMembers.slice(
        start,
        start + perPage
      );
    }

    // Save sorted data in localStorage
    paginatedData = sortedPaginatedData;

    // Refresh the current page to reflect sorting
    updatePage();
  });

  // Fetch columns and filters on page load
  fetchColumns();
  fetchFilters();
  fetchAddMemberFields();
  addMember();
});
