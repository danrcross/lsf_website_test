$(document).ready(function () {
  // Event listener for tabs at top of page
  $("#tabs").tabs();

  var members = []; // Array to store member data

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
              if (
                field === "LSF_Number" &&
                typeof filterOptions[field] === "object" &&
                filterOptions[field].type === "range"
              ) {
                let { min, max } = filterOptions[field];

                filterHtml += `
    <div class="filt-item">
      <label>LSF Number:</label>
      <input type="number" id="filt-LSF_Number" placeholder="Exact LSF Number" />
      <div class="range-wrapper">
        <input type="range" id="rangeMin-LSF_Number" min="${min}" max="${max}" value="${min}" />
        <input type="range" id="rangeMax-LSF_Number" min="${min}" max="${max}" value="${max}" />
        <div class="range-values">
          <span>From: <span id="rangeMinVal">${min}</span></span>
          <span>To: <span id="rangeMaxVal">${max}</span></span>
        </div>
      </div>
      <div class="apply-range-checkbox">
        <input type="checkbox" id="applyLSFRange" />
        <label for="applyLSFRange">Apply LSF Range Filter</label>
      </div>
    </div>
  `;
                return; // Skip default rendering for LSF_Number field
              }

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
        // Update displayed values when range sliders change
        $(document).on("input", "#rangeMin-LSF_Number", function () {
          $("#rangeMinVal").text($(this).val());
        });

        $(document).on("input", "#rangeMax-LSF_Number", function () {
          $("#rangeMaxVal").text($(this).val());
        });
      },
      error: function (xhr, status, error) {
        console.error("AJAX error:", error);
      },
    });
  }

  // Handle collapsible filter groups with arrow indicators
  $(document).on("click", ".filter-group legend", function () {
    let filterItems = $(this).next(".filter-items");
    let arrow = $(this).find(".toggle-arrow");

    filterItems.slideToggle(200, function () {
      arrow.text(filterItems.is(":visible") ? "▲" : "▼");
    });
  });

  function fetchTotalMemberCount() {
    $.ajax({
      url: "queries/get_member_count.php",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.status === "success") {
          $("#limitInput").val(response.total);
          myQuery.limit = response.total;
        } else {
          console.error("Failed to fetch member count:", response.message);
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX error fetching total count:", error);
      },
    });
  }

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

              let label = fieldData.name.replace(/_/g, " ");
              let fieldInput = "";

              // For LSF_Number, add the "Use Next LSF #" button
              if (fieldData.name === "LSF_Number") {
                fieldInput = `
                  <div class="lsf-input-wrapper">
                    <input type="number" id="${fieldData.name}" name="${fieldData.name}">
                    <button type="button" class="get-next-lsf-btn">Use Next LSF #</button>
                  </div>
                `;
              } else if (["Deceased", "Duplicate"].includes(fieldData.name)) {
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
                fieldInput = `<input type="text" id="${fieldData.name}" name="${fieldData.name}">`;
              } else if (fieldData.type.includes("int")) {
                fieldInput = `<input type="number" id="${fieldData.name}" name="${fieldData.name}">`;
              } else if (fieldData.type.includes("date")) {
                fieldInput = `<input type="date" id="${fieldData.name}" name="${fieldData.name}">`;
              }

              fieldHtml += `
                            <div class="member-field">
                                <label for="${fieldData.name}">${label}:</label>
                                ${fieldInput}
                            </div>
                        `;
            });

            fieldHtml += `</div></fieldset>`;
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
    // Clear all text inputs in filters
    $("input[id^='filt-']").val("");
    // Reset all dropdowns in filters to "All"
    $("select[id^='filt-']").val("All");
    // Uncheck the LSF Range checkbox and reset the range sliders to default values
    $("#applyLSFRange").prop("checked", false);
    let lsfMinInput = $("#rangeMin-LSF_Number");
    let lsfMaxInput = $("#rangeMax-LSF_Number");
    if (lsfMinInput.length && lsfMaxInput.length) {
      let defaultMin = lsfMinInput.attr("min");
      let defaultMax = lsfMaxInput.attr("max");
      lsfMinInput.val(defaultMin);
      lsfMaxInput.val(defaultMax);
      $("#rangeMinVal").text(defaultMin);
      $("#rangeMaxVal").text(defaultMax);
    }
  });

  function getFilterValues() {
    let filterVals = {};
    // Special case: LSF Number
    let exactLSF = $("#filt-LSF_Number").val().trim();
    let rangeMin = $("#rangeMin-LSF_Number").val();
    let rangeMax = $("#rangeMax-LSF_Number").val();
    let applyRange = $("#applyLSFRange").is(":checked");

    if (exactLSF) {
      filterVals["LSF_Number"] = exactLSF;
    } else if (applyRange && rangeMin && rangeMax && rangeMin !== rangeMax) {
      filterVals["LSF_Number_range"] = { min: rangeMin, max: rangeMax };
    }

    $("input[id^='filt-']").each(function () {
      let key = $(this).attr("id").replace("filt-", "");
      let value = $(this).val().trim();
      if (key !== "LSF_Number" && !filterVals[key] && value) {
        filterVals[key] = value;
      }
    });

    $("select[id^='filt-']").each(function () {
      let key = $(this).attr("id").replace("filt-", "");
      let value = $(this).val();

      if (key === "Deceased" || key === "Duplicate") {
        if (value === "Yes") {
          filterVals[key] = "1";
        } else if (value === "No") {
          filterVals[key] = "0";
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
                    ${columns
                      .map((column) => {
                        return `<option value="${column}">${column.replace(
                          /_/g,
                          " "
                        )}</option>`;
                      })
                      .join("")}
                  </select>
                  <select id="order">
                    <option value="ASC">Ascending</option>
                    <option value="DESC">Descending</option>
                  </select>
                  <button id="sortBtn">Sort</button>
            `);
  }

  $(document).on("change", "#sort, #order", function () {
    myQuery.sortColumn = $("#sort").val();
    myQuery.sortOrder = $("#order").val();
  });

  // Render members in a table, along with edit, save, delete, and verify buttons
  function renderMembers(members) {
    const nonEditableColumns = ["SAP_Level", "eSAP_Level"];

    let output = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Actions</th>
    `;
    let columns = Object.keys(members.length ? members[0] : {});

    columns.forEach((column) => {
      output += `<th>${column.replace(/_/g, " ")}</th>`;
    });

    output += `</tr></thead><tbody class="scrollable-tbody">`;

    members.forEach((member, index) => {
      output += `<tr data-index="${index}">`;
      output += `
      <td>
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="save-btn" data-index="${index}" style="display: none;">Save</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
        <button class="verify-btn" data-index="${index}">Verify Address</button>
      </td>
    `;
      columns.forEach((column) => {
        if (column === "id") {
          output += `<td>${member[column]}</td>`;
        } else if (nonEditableColumns.includes(column)) {
          output += `<td>${member[column] ?? ""}</td>`;
        } else {
          output += `<td class="editable" data-column="${column}">${
            member[column] ?? ""
          }</td>`;
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

    if (editBtn.text() === "Edit") {
      // Turn each editable cell into either an <input> or a <select>
      row.find(".editable").each(function () {
        let cell = $(this);
        let column = cell.data("column");
        let text = cell.text().trim();

        if (column === "Deceased" || column === "Duplicate") {
          // dropdown with True/False
          cell.html(`
          <select class="boolean-select">
            <option value="">False</option>
            <option value="1" ${text === "1" ? "selected" : ""}>True</option>
          </select>
        `);
        } else {
          // the old text input
          cell.html(`<input type="text" value="${text}">`);
        }
      });

      saveBtn.show();
      editBtn.text("Cancel");
    } else {
      // Cancel: just tear down the inputs, restoring whatever was in them
      row.find(".editable").each(function () {
        let cell = $(this);
        let val = cell.find("input, select").val() || "";
        // if it was boolean, we store/display as empty or "1"
        cell.text(val);
      });

      saveBtn.hide();
      editBtn.text("Edit");
    }
  });

  // Save Button Event Handler
  $(document).on("click", ".save-btn", function () {
    const rowIndex = $(this).data("index");
    const row = $(`tr[data-index="${rowIndex}"]`);
    const editBtn = row.find(".edit-btn");
    const memberId = row.find("td:nth-child(2)").text().trim();

    if (!memberId) {
      alert("Error: Member ID is missing.");
      return;
    }
    if (!confirm("Are you sure you want to save the changes?")) return;

    // 1) Gather the updated values
    let rowData = {};
    row.find(".editable").each(function () {
      let cell = $(this);
      let columnName = cell.data("column");
      let newValue;

      if (columnName === "Deceased" || columnName === "Duplicate") {
        // True/False dropdown
        let sel = cell.find("select.boolean-select").val();
        newValue = sel === "1" ? 1 : null;
      } else {
        // Text inputs
        newValue = cell.find("input").val().trim();
      }

      rowData[columnName] = newValue;
    });

    // 2) Send to the server
    $.ajax({
      url: "queries/edit.php",
      type: "POST",
      data: { data: rowData, id: memberId },
      dataType: "json",
      success: function (response) {
        if (!response.success) {
          alert("Error: " + response.message);
          return;
        }

        // === MERGE & RE-RENDER ===

        // Merge the updated fields into our in-memory data
        const pageArr = paginatedData.pages[myQuery.page];
        const memberObj = pageArr[rowIndex];
        Object.assign(memberObj, rowData);

        // Repaint the entire table from paginatedData
        updatePage();

        // Optionally, reset the buttons if updatePage didn't already
        // find the row again (since updatePage rebuilds the whole table):
        // $(`tr[data-index="${rowIndex}"] .save-btn`).hide();
        // $(`tr[data-index="${rowIndex}"] .edit-btn`).text("Edit");

        // ==========================
      },
      error: function () {
        alert("Failed to save changes. Please try again.");
      },
    });
  });

  // Delete Button Event Handler
  $(document).on("click", ".delete-btn", function () {
    let row = $(this).closest("tr");
    let memberId = row.find("td:nth-child(2)").text().trim();

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
          row.remove();
          Object.keys(paginatedData.pages).forEach((page) => {
            paginatedData.pages[page] = paginatedData.pages[page].filter(
              (member) => member.id != memberId
            );
          });
          paginatedData.totalResults--;
          paginatedData.totalPages = Math.ceil(
            paginatedData.totalResults / paginatedData.perPage
          );
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

  // Verify Address Button Event Handler
  $(document).on("click", ".verify-btn", function () {
    const rowIndex = $(this).data("index");
    const row = $(`tr[data-index="${rowIndex}"]`);

    const address = row.find("td[data-column='Address']").text().trim();
    const city = row.find("td[data-column='City']").text().trim();
    const state = row.find("td[data-column='State']").text().trim();
    const zip = row.find("td[data-column='Zip']").text().trim();
    const country = row.find("td[data-column='Country']").text().trim();

    const fullAddress = `${address}, ${city}, ${state} ${zip}, ${country}`;
    const apiKey = "AIzaSyARUf-vDFQL2PCsWoTmTE_4gXbEIyf2VEk"; // Replace with your API key

    if (!address) {
      alert("No address found for this member.");
      return;
    }

    $.ajax({
      url: "https://maps.googleapis.com/maps/api/geocode/json",
      method: "GET",
      data: {
        address: fullAddress,
        key: apiKey,
      },
      success: function (res) {
        if (res.status === "OK" && res.results.length > 0) {
          const formatted = res.results[0].formatted_address;
          alert(`✅ Address is valid:\n\n${formatted}`);
        } else {
          alert("❌ Address not found. Please review this entry.");
        }
      },
      error: function () {
        alert("⚠️ Failed to contact Google Maps API.");
      },
    });
  });

  // Handler for "Use Next LSF #" button on the Add Member form
  $(document).on("click", ".get-next-lsf-btn", function () {
    $.ajax({
      url: "queries/get_next_lsf.php",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.success) {
          $("#LSF_Number").val(response.nextLSF);
        } else {
          alert("Error: " + response.message);
        }
      },
      error: function () {
        alert("Failed to fetch next LSF number.");
      },
    });
  });

  function addMember() {
    $("#addMemberForm").submit(function (event) {
      event.preventDefault();

      let formData = {};
      $("#addMemberForm")
        .find("input, select")
        .each(function () {
          let key = $(this).attr("name");
          let value = $(this).val();

          if (value === "") value = null;
          if (key === "Deceased" || key === "Duplicate") {
            value = value === "1" ? 1 : 0;
          }
          formData[key] = value;
        });

      $.ajax({
        url: "queries/add.php",
        type: "POST",
        data: JSON.stringify(formData),
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
          if (response.success) {
            alert("Member added successfully!");
            $("#addMemberForm")[0].reset();
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

  function updatePage() {
    if (!paginatedData.pages) return;

    let pageData = paginatedData.pages[myQuery.page] || [];

    renderMembers(pageData);
    renderPagination();
  }

  $("#searchBtn").click(function () {
    updateSelectedColumns();
    myQuery = {
      columns: myQuery.columns,
      filters: getFilterValues(),
      limit: $("#limitInput").val(),
      perPage: $("#perPageInput").val(),
      sortColumn: "id",
      sortOrder: "ASC",
      page: 1,
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
          members = response.members;
          createPages(response.members);
          updatePage();
          renderSort(response.members);

          let countMessage = `<p class="results-count">This search returned <strong>${response.members.length}</strong> results.</p>`;
          $("#resCount").html(countMessage);
          $("#downloadButtons").removeClass("hidden");
        } else {
          $("#results").html("<p>No results found.</p>");
          $("#downloadButtons").addClass("hidden");
        }
      },
      error: function () {
        $("#results").html("<p>Server error. Please try again.</p>");
      },
    });
  });

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

  $(document).on("click", "#sortBtn", function () {
    if (!paginatedData || !paginatedData.pages) {
      console.error("No data available for sorting.");
      return;
    }

    let allMembers = Object.values(paginatedData.pages).flat();
    let sortColumn = $("#sort").val();
    let sortOrder = $("#order").val();

    allMembers.sort((a, b) => {
      let valA = a[sortColumn] || "";
      let valB = b[sortColumn] || "";
      if (!isNaN(valA) && !isNaN(valB)) {
        valA = Number(valA);
        valB = Number(valB);
      }
      if (sortOrder === "ASC") {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });

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

    paginatedData = sortedPaginatedData;
    updatePage();
  });

  $(document).on("click", ".get-next-lsf-btn", function () {
    $.ajax({
      url: "queries/get_next_lsf.php",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.success) {
          $("#LSF_Number").val(response.nextLSF);
        } else {
          alert("Error: " + response.message);
        }
      },
      error: function () {
        alert("Failed to fetch next LSF number.");
      },
    });
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

    // Save the generated PDF with a filename.
    doc.save("search_results.pdf");
  }

  function downloadCSV(results) {
    if (!results || !results.length) {
      alert("No results to download.");
      return;
    }

    // Extract column headers from the keys of the first result
    const headers = Object.keys(results[0]);
    // Convert headers and rows to CSV format
    const csvRows = [];
    csvRows.push(headers.join(","));

    results.forEach((result) => {
      const values = headers.map((header) => {
        let val = result[header];
        if (typeof val === "string") {
          // Escape double quotes and wrap the value in quotes if necessary
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      });
      csvRows.push(values.join(","));
    });

    // Create CSV string and trigger download
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "search_results.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  $(document).on("click", "#downloadCSVBtn", function () {
    // Assuming your search results are stored in a variable called 'currentResults'
    downloadCSV(members);
  });

  $(document).on("click", "#downloadPDFBtn", function () {
    downloadPDF(members);
  });

  // Fetch columns and filters on page load
  fetchColumns();
  fetchFilters();
  fetchAddMemberFields();
  addMember();
  fetchTotalMemberCount();
});
