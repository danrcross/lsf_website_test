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
  // Fetch and render columns dynamically
  function fetchColumns() {
    $.ajax({
      url: "queries/render_columns.php",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.status === "success") {
          let columnGroups = response.columnGroups;
          let container = $("#col-sel-ctnr");

          // Clear existing checkboxes
          container.empty();

          // Add "Select All" toggle button
          container.append(`
                    <button id="select-all-toggle" class="toggle-btn">Select All</button>
                `);

          // Loop through column groups and create checkboxes
          Object.keys(columnGroups).forEach((group) => {
            let checkboxHTML = `
                        <div class="checkbox-item">
                            <label for="cb-${group}">
                                ${group}
                                <input type="checkbox" class="column-group" id="cb-${group}" data-columns="${columnGroups[
              group
            ].join(",")}" />
                            </label>
                        </div>
                    `;
            container.append(checkboxHTML);
          });

          // "Select All" Toggle Button Functionality
          $("#select-all-toggle").click(function () {
            let allChecked =
              $(".column-group").length === $(".column-group:checked").length;
            $(".column-group").prop("checked", !allChecked);
            $(this).text(allChecked ? "Select All" : "Deselect All");
          });

          // Handle individual group checkbox selection
          $(document).on("change", ".column-group", function () {
            updateSelectedColumns();
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

  // Update selected columns dynamically
  function updateSelectedColumns() {
    let selectedColumns = ["id"]; // Ensure ID is always included

    $(".column-group:checked").each(function () {
      let columns = $(this).data("columns").split(",");
      selectedColumns.push(...columns);
    });

    myQuery.columns = selectedColumns;
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

          filterContainer.empty(); // Clear existing filters

          // Define filter groups
          const filterGroups = {
            "LSF Number": ["LSF_Number"],
            "AMA Number": ["AMA_Number"],
            Name: ["First_Name", "Last_Name"],
            Location: [
              "Address",
              "City",
              "State",
              "Zip",
              "Country",
              "Country_Coordinator",
            ],
            "SAP Data": [
              "SAP_Aspirant",
              "SAP_Level_1",
              "SAP_Level_2",
              "SAP_Level_3",
              "SAP_Level_4",
              "SAP_Level_5",
              "SAP_Level",
            ],
            "eSAP Data": [
              "eSAP_Aspirant",
              "eSAP_Level_1",
              "eSAP_Level_2",
              "eSAP_Level_3",
              "eSAP_Level_4",
              "eSAP_Level_5",
              "eSAP_Level",
            ],
            Miscellaneous: ["Miscellaneous", "Deceased", "Duplicate"],
          };

          // Loop through filter groups
          Object.keys(filterGroups).forEach((group) => {
            let fields = filterGroups[group];
            let filterHtml = `
                        <fieldset class="filter-group">
                            <legend>
                                ${group}
                                <span class="toggle-arrow">▼</span>
                            </legend>
                            <div class="filter-items">`;

            // Loop through fields in each group
            fields.forEach((field) => {
              if (filterOptions[field]) {
                if (Array.isArray(filterOptions[field])) {
                  // Dropdown menu
                  let optionsHtml = filterOptions[field]
                    .map(
                      (value) => `<option value="${value}">${value}</option>`
                    )
                    .join("");

                  filterHtml += `
                                    <div class="filt-item">
                                        <label for="filt-${field}">${field.replace(
                    /_/g,
                    " "
                  )}:</label>
                                        <select id="filt-${field}">
                                            <option value="">All</option>
                                            ${optionsHtml}
                                        </select>
                                    </div>
                                `;
                } else {
                  // Text input
                  filterHtml += `
                                    <div class="filt-item">
                                        <label for="filt-${field}">${field.replace(
                    /_/g,
                    " "
                  )}:</label>
                                        <input type="text" id="filt-${field}" placeholder="Search ${field.replace(
                    /_/g,
                    " "
                  )}">
                                    </div>
                                `;
                }
              }
            });

            filterHtml += `</div></fieldset>`; // Close fieldset
            filterContainer.append(filterHtml);
          });

          // Add Reset Filters Button
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

  // Handle collapsible filter groups
  // Handle collapsible filter groups with arrow indicators
  $(document).on("click", ".filter-group legend", function () {
    let filterItems = $(this).next(".filter-items");
    let arrow = $(this).find(".toggle-arrow");

    filterItems.slideToggle(200, function () {
      arrow.text(filterItems.is(":visible") ? "▲" : "▼");
    });
  });

  function fetchAddMemberFields() {
    $.ajax({
      url: "queries/render_add_fields.php",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.status === "success") {
          let fields = response.fields;
          let formContainer = $("#addMemberForm");

          formContainer.empty(); // Clear existing fields

          const nonEditableFields = ["id", "SAP_Level", "eSAP_Level"]; // Fields to exclude

          // Define field groups
          const fieldGroups = {
            "LSF Number": ["LSF_Number"],
            "AMA Number": ["AMA_Number"],
            Name: ["First_Name", "Last_Name"],
            Location: [
              "Address",
              "City",
              "State",
              "Zip",
              "Country",
              "Country_Coordinator",
            ],
            "SAP Data": [
              "SAP_Aspirant",
              "SAP_Level_1",
              "SAP_Level_2",
              "SAP_Level_3",
              "SAP_Level_4",
              "SAP_Level_5",
            ],
            "eSAP Data": [
              "eSAP_Aspirant",
              "eSAP_Level_1",
              "eSAP_Level_2",
              "eSAP_Level_3",
              "eSAP_Level_4",
              "eSAP_Level_5",
            ],
            Miscellaneous: ["Miscellaneous", "Deceased", "Duplicate"],
          };

          // Loop through field groups
          Object.keys(fieldGroups).forEach((group) => {
            let fieldsInGroup = fieldGroups[group].filter(
              (field) => !nonEditableFields.includes(field)
            );
            if (fieldsInGroup.length === 0) return; // Skip empty groups

            let fieldHtml = `
                        <fieldset class="add-member-group">
                            <legend>
                                ${group}
                                <span class="toggle-arrow">▼</span>
                            </legend>
                            <div class="add-member-fields">`;

            // Loop through each field in the group
            fieldsInGroup.forEach((field) => {
              let fieldData = fields.find((f) => f.name === field);
              if (!fieldData) return;

              let label = fieldData.name.replace(/_/g, " "); // Clean column names
              let fieldInput = "";

              if (["Deceased", "Duplicate"].includes(fieldData.name)) {
                // Yes/No dropdowns
                fieldInput = `
                                <select id="${fieldData.name}" name="${fieldData.name}">
                                    <option value="">Select</option>
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>`;
              } else if (
                fieldData.type.includes("varchar") ||
                fieldData.type.includes("text")
              ) {
                // Text input
                fieldInput = `<input type="text" id="${fieldData.name}" name="${fieldData.name}">`;
              } else if (fieldData.type.includes("int")) {
                // Number input
                fieldInput = `<input type="number" id="${fieldData.name}" name="${fieldData.name}">`;
              } else if (fieldData.type.includes("date")) {
                // Date picker
                fieldInput = `<input type="date" id="${fieldData.name}" name="${fieldData.name}">`;
              }

              fieldHtml += `
                            <div class="member-field">
                                <label for="${fieldData.name}">${label}:</label>
                                ${fieldInput}
                            </div>
                        `;
            });

            fieldHtml += `</div></fieldset>`; // Close fieldset
            formContainer.append(fieldHtml);
          });

          // Add Submit Button
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

  // Handle collapsible add member groups with arrow indicators
  $(document).on("click", ".add-member-group legend", function () {
    let fields = $(this).next(".add-member-fields");
    let arrow = $(this).find(".toggle-arrow");

    fields.slideToggle(200, function () {
      arrow.text(fields.is(":visible") ? "▲" : "▼");
    });
  });

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
    let row = $(this).closest("tr"); // Get the row to delete
    let memberId = row.find("td:nth-child(2)").text().trim(); // Get member ID (assuming it's in the second column)

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

          // Remove the row from the UI immediately
          row.remove();

          // Find and remove the member from paginatedData
          Object.keys(paginatedData.pages).forEach((page) => {
            paginatedData.pages[page] = paginatedData.pages[page].filter(
              (member) => member.id != memberId
            );
          });

          // Recalculate pagination to reflect the removed row
          paginatedData.totalResults--;
          paginatedData.totalPages = Math.ceil(
            paginatedData.totalResults / paginatedData.perPage
          );

          // Update the UI
          updatePage();
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
    updateSelectedColumns(); // Ensure selected columns are updated

    // Update myQuery object
    myQuery = {
      columns: myQuery.columns, // Use the updated column selection
      filters: getFilterValues(),
      limit: $("#limitInput").val(),
      perPage: $("#perPageInput").val(),
      sortColumn: "id",
      sortOrder: "ASC",
      page: 1,
    };

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
          updatePage();
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
