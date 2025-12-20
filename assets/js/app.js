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
    quickFilters: {},
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
        if (response.status !== "success") {
          console.error("Error fetching filters:", response.message);
          return;
        }

        const filterOptions = response.filterOptions;
        const filterContainer = $("#fil-sch-ctnr");
        filterContainer.empty();

        const filterGroups = {
          "LSF Number": ["LSF_Number"],
          "AMA Number": ["AMA_Number"],
          Name: ["First_Name", "Last_Name", "email"],
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
          Miscellaneous: [
            "Miscellaneous",
            "Deceased",
            "Duplicate",
            "Bad_Email",
          ],
        };

        Object.keys(filterGroups).forEach((group) => {
          const fields = filterGroups[group];
          let html = `
          <fieldset class="filter-group">
            <legend>${group} <span class="toggle-arrow">▼</span></legend>
            <div class="filter-items">
        `;
          let booleanHeaderAdded = false; // flag for boolean group

          fields.forEach((field) => {
            // 1) Range special-case for LSF_Number
            if (
              field === "LSF_Number" &&
              filterOptions[field]?.type === "range"
            ) {
              const { min, max } = filterOptions[field];
              html += `
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
              return;
            }

            const opts = filterOptions[field];
            if (!opts) return;

            // 2) Boolean checkbox filters (Deceased, Duplicate, Bad_Email)
            if (["Deceased", "Duplicate", "Bad_Email"].includes(field)) {
              if (!booleanHeaderAdded) {
                html += `<div class="boolean-group">
                        <strong>Search only for members who are:</strong><br/>`;
                booleanHeaderAdded = true;
              }

              html += `
              <label>
                <input type="checkbox" id="filt-${field}" value="1" />
                ${field.replace(/_/g, " ")}
              </label>
            `;

              // close the boolean group after the last boolean field
              if (field === "Bad_Email") {
                html += `</div>`;
              }
            }
            // 3) Select dropdowns for array options
            else if (Array.isArray(opts)) {
              const unique = [
                ...new Set(
                  opts.filter(
                    (v) =>
                      v != null && v !== "" && String(v).toLowerCase() !== "all"
                  )
                ),
              ];
              const optionsHtml = unique
                .map((v) => `<option value="${v}">${v}</option>`)
                .join("");
              html += `
              <div class="filt-item">
                <label for="filt-${field}">${field.replace(/_/g, " ")}:</label>
                <select id="filt-${field}">
                  <option value="">All</option>
                  ${optionsHtml}
                </select>
              </div>
            `;
            }
            // 4) Fallback → text input
            else {
              html += `
              <div class="filt-item">
                <label for="filt-${field}">${field.replace(/_/g, " ")}:</label>
                <input type="text"
                       id="filt-${field}"
                       placeholder="Search ${field.replace(/_/g, " ")}" />
              </div>
            `;
            }
          });

          html += `
            </div>
          </fieldset>
        `;
          filterContainer.append(html);
        });

        // Reset button
        filterContainer.append(`
        <div class="reset-container">
          <button id="resetFilters">Reset Filters</button>
        </div>
      `);

        // Re-hook range sliders
        $(document).on("input", "#rangeMin-LSF_Number", function () {
          $("#rangeMinVal").text($(this).val());
        });
        $(document).on("input", "#rangeMax-LSF_Number", function () {
          $("#rangeMaxVal").text($(this).val());
        });
      },
      error(xhr, status, error) {
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
        if (response.status !== "success") {
          console.error("Error fetching fields:", response.message);
          return;
        }

        let fields = response.fields;
        let formContainer = $("#addMemberForm");
        formContainer.empty(); // Clear existing fields

        const nonEditableFields = ["id", "SAP_Level", "eSAP_Level"]; // Fields to exclude

        const fieldGroups = {
          "LSF Number": ["LSF_Number"],
          "AMA Number": ["AMA_Number"],
          Name: ["First_Name", "Last_Name", "email"],
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
          Miscellaneous: [
            "Miscellaneous",
            "Deceased",
            "Duplicate",
            "Bad_Email",
          ],
        };

        Object.keys(fieldGroups).forEach((group) => {
          let fieldsInGroup = fieldGroups[group].filter(
            (f) => !nonEditableFields.includes(f)
          );
          if (!fieldsInGroup.length) return;

          let fieldHtml = `<fieldset class="add-member-group">
                          <legend>${group} <span class="toggle-arrow">▼</span></legend>
                          <div class="add-member-fields" >`;

          // Separate boolean fields to render in one flex row
          const booleanFields = ["Deceased", "Duplicate", "Bad_Email"];
          const regularFields = fieldsInGroup.filter(
            (f) => !booleanFields.includes(f)
          );

          // Regular fields
          regularFields.forEach((field) => {
            let fieldData = fields.find((f) => f.name === field);
            if (!fieldData) return;
            let label = fieldData.name.replace(/_/g, " ");
            let fieldInput = "";

            if (fieldData.name === "LSF_Number") {
              fieldInput = `
              <div class="lsf-input-wrapper">
                <input type="number" id="${fieldData.name}" name="${fieldData.name}">
                <button type="button" class="get-next-lsf-btn">Use Next LSF #</button>
              </div>`;
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

            fieldHtml += `<div class="member-field">
                          <label for="${fieldData.name}">${label}:</label>
                          ${fieldInput}
                        </div>`;
          });

          // Boolean fields in one row
          const booleanFieldsPresent = fieldsInGroup.filter((f) =>
            booleanFields.includes(f)
          );
          if (booleanFieldsPresent.length) {
            fieldHtml += `<div class="member-field" style="display:flex; gap:12px;">`;
            booleanFieldsPresent.forEach((field) => {
              let label = field.replace(/_/g, " ");
              fieldHtml += `<div style="display:flex; align-items:center; gap:6px;">
                            <input type="checkbox" id="${field}" name="${field}">
                            <label for="${field}">${label}</label>
                          </div>`;
            });
            fieldHtml += `</div>`;
          }

          fieldHtml += `</div></fieldset>`;
          formContainer.append(fieldHtml);
        });

        // Submit button
        formContainer.append('<button type="submit">Add Member</button>');
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
    $("#filt-Deceased, #filt-Duplicate, #filt-Bad_Email").prop(
      "checked",
      false
    );

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

    // ---- LSF Number (exact / range) ----
    let exactLSF = $("#filt-LSF_Number").val()?.trim();
    let rangeMin = $("#rangeMin-LSF_Number").val();
    let rangeMax = $("#rangeMax-LSF_Number").val();
    let applyRange = $("#applyLSFRange").is(":checked");

    if (exactLSF) {
      filterVals["LSF_Number"] = exactLSF;
    } else if (applyRange && rangeMin && rangeMax && rangeMin !== rangeMax) {
      filterVals["LSF_Number_range"] = {
        min: rangeMin,
        max: rangeMax,
      };
    }

    // ---- TEXT + NUMBER INPUTS (EXCLUDE CHECKBOXES) ----
    $("input[id^='filt-']").each(function () {
      if (this.type === "checkbox") return;

      let key = this.id.replace("filt-", "");
      let value = $(this).val()?.trim();

      if (key !== "LSF_Number" && value !== "" && value !== "All") {
        filterVals[key] = value;
      }
    });

    // ---- BOOLEAN CHECKBOX FILTERS ----
    ["Deceased", "Duplicate", "Bad_Email"].forEach((field) => {
      const el = $(`#filt-${field}`);
      if (el.length && el.is(":checked")) {
        filterVals[field] = true;
      }
    });

    // ---- SELECT DROPDOWNS ----
    $("select[id^='filt-']").each(function () {
      let key = this.id.replace("filt-", "");
      let value = $(this).val();

      if (value && value !== "All") {
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
                <label for="sort"><strong>Sort by:</strong></label>
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
    const booleanColumns = ["Deceased", "Duplicate", "Bad_Email"];

    // Get all columns from the first member object
    let columns = Object.keys(members.length ? members[0] : {});

    // Ensure boolean columns are always present
    booleanColumns.forEach((col) => {
      if (!columns.includes(col)) columns.push(col);
    });

    let output = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" id="selectAllRows" /></th>
            <th>Actions</th>
  `;

    // column headers
    columns.forEach((column) => {
      output += `<th>${column.replace(/_/g, " ")}</th>`;
    });

    output += `</tr></thead><tbody class="scrollable-tbody">`;

    // rows
    members.forEach((member, index) => {
      output += `<tr data-index="${index}">`;

      // Row checkbox
      output += `<td><input type="checkbox" class="rowCheckbox" data-id="${member.id}" /></td>`;

      // Actions
      output += `
      <td>
        <button class="edit-btn"   data-index="${index}">Edit</button>
        <button class="save-btn"   data-index="${index}" style="display:none">Save</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
        <button class="verify-btn" data-index="${index}">Verify Address</button>
      </td>
    `;

      // Data cells
      columns.forEach((column) => {
        let value = member[column] ?? ""; // default empty if undefined or null

        if (column === "id") {
          output += `<td data-column="id">${value}</td>`;
        } else if (nonEditableColumns.includes(column)) {
          output += `<td>${value}</td>`;
        } else if (booleanColumns.includes(column)) {
          output += `<td class="editable" data-column="${column}">${value}</td>`;
        } else {
          output += `<td class="editable" data-column="${column}">${value}</td>`;
        }
      });

      output += `</tr>`;
    });

    output += `</tbody></table></div>`;
    $("#results").html(output);
  }

  // update bulk‐toolbar visibility & count
  /**
   * Show/hide bulk-toolbar and always update the "X selected" count.
   */
  function updateBulkToolbar() {
    // how many are checked?
    const n = $(".rowCheckbox:checked").length;

    // always update the text
    $("#bulkCount").text(n + " selected");

    // show the bar when at least one, hide when zero
    if (n > 0) {
      $("#bulkToolbar").removeClass("hidden");
    } else {
      $("#bulkToolbar").addClass("hidden");
    }

    // ── NEW: disable or enable the buttons based on n ──
    $("#bulkEditBtn, #bulkDeleteBtn").prop("disabled", n === 0);
  }

  /**
   * Prompt the user “Are you sure?” and then POST to bulk_delete.php.
   */
  function showBulkDeleteDialog() {
    const n = $(".rowCheckbox:checked").length;
    $("<div>")
      .html(
        `<p>Are you sure you want to delete <strong>${n}</strong> records?</p>`
      )
      .dialog({
        modal: true,
        title: "Confirm Bulk Delete",
        buttons: {
          Delete() {
            const ids = $(".rowCheckbox:checked")
              .map((_, el) => $(el).data("id"))
              .get();
            $.ajax({
              url: "queries/bulk_delete.php",
              method: "POST",
              data: JSON.stringify({ ids }),
              contentType: "application/json",
              dataType: "json",
              success(resp) {
                if (resp.success) {
                  // remove from in-memory & re-render
                  Object.keys(paginatedData.pages).forEach((p) => {
                    paginatedData.pages[p] = paginatedData.pages[p].filter(
                      (m) => !ids.includes(m.id)
                    );
                  });
                  paginatedData.totalResults -= ids.length;
                  paginatedData.totalPages = Math.ceil(
                    paginatedData.totalResults / paginatedData.perPage
                  );
                  updatePage();
                } else {
                  alert("Error: " + resp.message);
                }
              },
            });
            $(this).dialog("close");
          },
          Cancel() {
            $(this).dialog("close");
          },
        },
      });
  }

  /**
   * Build a simple form for every editable column
   * and POST the non-blank values to bulk_edit.php.
   */
  function showBulkEditDialog() {
    const editableCols = myQuery.columns.filter(
      (c) => c !== "id" && c !== "SAP_Level" && c !== "eSAP_Level"
    );
    const dateCols = [
      "Last_Contact",
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
    ];

    let form = `<form id="bulkEditForm" style="display:flex; flex-direction:column;">`;

    // Header row
    form += `<div style="display:flex; font-weight:bold; margin-bottom:8px; align-items:center;">
             <div style="width:70px; text-align:center;">Apply?</div>
             <div style="flex:1; padding-left:5px;">Field</div>
             <div style="flex:2; padding-left:5px;">Value</div>
           </div>`;

    // Data rows
    editableCols.forEach((col) => {
      form += `<div style="display:flex; align-items:center; margin-bottom:6px;">
      <div style="width:70px; text-align:center;">
        <input type="checkbox" class="apply-checkbox" data-col="${col}" />
      </div>
      <div style="flex:1; padding-left:5px;">${col.replace(/_/g, " ")}</div>
      <div style="flex:2; padding-left:5px;">`;

      if (["Deceased", "Duplicate", "Bad_Email"].includes(col)) {
        form += `<input type="checkbox" id="bulk_${col}" />`;
      } else if (dateCols.includes(col)) {
        form += `<input type="text" id="bulk_${col}" class="bulk-datepicker" placeholder="YYYY-MM-DD" style="width:95%;" />`;
      } else {
        form += `<input type="text" id="bulk_${col}" placeholder="(leave blank)" style="width:95%;" />`;
      }

      form += `</div></div>`;
    });

    form += `</form>`;

    const $dlg = $("<div>").html(form).appendTo("body");
    $dlg.find(".bulk-datepicker").datepicker({ dateFormat: "yy-mm-dd" });

    $dlg.dialog({
      modal: true,
      title: "Bulk Edit",
      width: 720,
      buttons: {
        Save() {
          const updates = {};
          $dlg.find(".apply-checkbox").each(function () {
            const col = $(this).data("col");
            if (!this.checked) return;

            const $valEl = $(`#bulk_${col}`);
            let val;
            if (["Deceased", "Duplicate", "Bad_Email"].includes(col)) {
              val = $valEl.is(":checked") ? 1 : 0;
            } else {
              val = $valEl.val().trim();
              if (!val) return;
            }
            updates[col] = val;
          });

          if (!Object.keys(updates).length) {
            return alert("Please check at least one field to apply.");
          }

          const ids = $(".rowCheckbox:checked")
            .map((_, el) => $(el).data("id"))
            .get();

          $.ajax({
            url: "queries/bulk_edit.php",
            method: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({ ids, updates }),
            success(resp) {
              if (!resp.success) return alert("Error: " + resp.message);
              Object.values(paginatedData.pages).forEach((page) => {
                page.forEach((m) => {
                  if (ids.includes(m.id)) Object.assign(m, updates);
                });
              });
              updatePage();
              $("<div>")
                .html("<p>Bulk edit applied successfully!</p>")
                .dialog({
                  modal: true,
                  title: "Success",
                  buttons: {
                    OK() {
                      $(this).dialog("close");
                    },
                  },
                });
            },
          });

          $dlg.dialog("close");
        },
        Cancel() {
          $dlg.dialog("close");
        },
      },
      close() {
        $dlg.dialog("destroy").remove();
      },
    });
  }

  // master toggle:
  $(document).on("change", "#selectAllRows", function () {
    $(".rowCheckbox").prop("checked", this.checked);
    updateBulkToolbar();
  });
  // individual row toggles
  $(document).on("change", ".rowCheckbox", updateBulkToolbar);

  // bulk toolbar buttons
  $(document).on("click", "#bulkDeleteBtn", showBulkDeleteDialog);
  $(document).on("click", "#bulkEditBtn", showBulkEditDialog);
  $(document).on("click", "#clearSelectionBtn", function () {
    $("#selectAllRows, .rowCheckbox").prop("checked", false);
    updateBulkToolbar();
  });

  // show the “are you sure?” delete dialog
  function showBulkDeleteDialog() {
    const n = $(".rowCheckbox:checked").length;
    $("#bulkDeleteDialog")
      .html(
        `<p>Are you sure you want to delete <strong>${n}</strong> records?</p>`
      )
      .dialog({
        modal: true,
        title: "Confirm Bulk Delete",
        buttons: {
          Delete() {
            const ids = $(".rowCheckbox:checked")
              .map((_, el) => $(el).data("id"))
              .get();
            $.ajax({
              url: "queries/bulk_delete.php",
              method: "POST",
              data: JSON.stringify({ ids }),
              contentType: "application/json",
              dataType: "json",
              success(resp) {
                if (resp.success) {
                  // remove from in‐memory and re‐render
                  Object.keys(paginatedData.pages).forEach((p) => {
                    paginatedData.pages[p] = paginatedData.pages[p].filter(
                      (m) => !ids.includes(m.id)
                    );
                  });
                  paginatedData.totalResults -= ids.length;
                  paginatedData.totalPages = Math.ceil(
                    paginatedData.totalResults / paginatedData.perPage
                  );
                  updatePage();
                } else {
                  alert("Error: " + resp.message);
                }
              },
            });
            $(this).dialog("close");
          },
          Cancel() {
            $(this).dialog("close");
          },
        },
      });
  }
  // select‐all checkbox toggles every row
  $(document).on("change", "#selectAllRows", function () {
    $(".rowCheckbox").prop("checked", this.checked);
    updateBulkToolbar();
  });

  // any individual row checkbox
  $(document).on("change", ".rowCheckbox", updateBulkToolbar);

  // bulk toolbar buttons
  $(document).on("click", "#bulkDeleteBtn", showBulkDeleteDialog);
  $(document).on("click", "#bulkEditBtn", showBulkEditDialog);
  $(document).on("click", "#clearSelectionBtn", function () {
    $("#selectAllRows, .rowCheckbox").prop("checked", false);
    updateBulkToolbar();
  });

  // Edit Button Event Handler (with datepicker for date columns)
  $(document).on("click", ".edit-btn", function () {
    const booleanColumns = ["Deceased", "Duplicate", "Bad_Email"];
    const dateColumns = [
      "Last_Contact",
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
    ];

    let rowIndex = $(this).data("index");
    let row = $(`tr[data-index="${rowIndex}"]`);
    let saveBtn = row.find(".save-btn");
    let editBtn = row.find(".edit-btn");

    if (editBtn.text() === "Edit") {
      // turn each editable cell into the appropriate input
      row.find(".editable").each(function () {
        let cell = $(this);
        let column = cell.data("column");
        let text = cell.text().trim();

        if (booleanColumns.includes(column)) {
          // Use checkbox for all boolean fields
          cell.html(`
          <input type="checkbox" class="boolean-checkbox" ${
            text === "1" ? "checked" : ""
          }>
        `);
        } else if (dateColumns.includes(column)) {
          // datepicker input
          cell.html(`<input type="text" class="date-input" value="${text}">`);
          cell.find(".date-input").datepicker({ dateFormat: "yy-mm-dd" });
        } else {
          // default text input
          cell.html(`<input type="text" value="${text}">`);
        }
      });

      saveBtn.show();
      editBtn.text("Cancel");
    } else {
      // cancel: tear down inputs and restore text
      row.find(".editable").each(function () {
        let cell = $(this);
        let val = cell.find("input, select").val() || "";
        if (cell.find("input.boolean-checkbox").length) {
          val = cell.find("input.boolean-checkbox").is(":checked") ? 1 : 0;
        }
        cell.text(val);
      });

      saveBtn.hide();
      editBtn.text("Edit");
    }
  });

  $(document).on("click", ".save-btn", function () {
    const rowIndex = $(this).data("index");
    const row = $(`tr[data-index="${rowIndex}"]`);
    const memberId = row.find('td[data-column="id"]').text().trim();

    if (!memberId) {
      alert("Error: Member ID is missing.");
      return;
    }
    if (!confirm("Are you sure you want to save the changes?")) return;

    // Gather updated values
    let rowData = {};
    row.find(".editable").each(function () {
      let cell = $(this);
      let columnName = cell.data("column");
      let newValue;

      // Check for checkbox first
      const checkbox = cell.find("input.boolean-checkbox");
      if (checkbox.length) {
        newValue = checkbox.is(":checked") ? 1 : 0; // convert to integer
      } else {
        newValue = cell.find("input, select").val().trim();
      }

      rowData[columnName] = newValue;
    });

    console.log("Saving member", memberId, rowData);

    // Send to the server
    $.ajax({
      url: "queries/edit.php",
      type: "POST",
      data: { data: rowData, id: memberId },
      dataType: "json",
      success: function (response) {
        console.log("Server response:", response);
        if (!response.success) {
          alert("Error: " + response.message);
          return;
        }

        // Update the in-memory data
        const pageArr = paginatedData.pages[myQuery.page];
        const memberObj = pageArr.find((m) => String(m.id) === memberId);
        if (memberObj) {
          Object.assign(memberObj, rowData);
        }

        updatePage();
      },
      error: function () {
        alert("Failed to save changes. Please try again.");
      },
    });
  });

  // Delete Button Event Handler
  // Delete Button Event Handler
  $(document).on("click", ".delete-btn", function () {
    const row = $(this).closest("tr");
    // grab the real ID cell
    const memberId = row.find('td[data-column="id"]').text().trim();

    if (!memberId) {
      alert("Error: Member ID is missing.");
      return;
    }

    if (!confirm("Are you sure you want to delete this member?")) return;

    $.ajax({
      url: "queries/delete.php",
      type: "POST",
      data: { id: memberId },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          // Remove the row from DOM...
          row.remove();

          // ...and update your in-memory data & re-render
          Object.keys(paginatedData.pages).forEach((p) => {
            paginatedData.pages[p] = paginatedData.pages[p].filter(
              (m) => m.id != memberId
            );
          });
          paginatedData.totalResults--;
          paginatedData.totalPages = Math.ceil(
            paginatedData.totalResults / paginatedData.perPage
          );
          updatePage();
        } else {
          alert("Error: " + response.message);
        }
      },
      error: function (xhr, status, error) {
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
    $("#addMemberForm")
      .off("submit")
      .on("submit", function (event) {
        event.preventDefault();

        const formData = {};

        $(this)
          .find("input, select")
          .each(function () {
            const key = this.name;
            if (!key) return;

            // ✅ Correct checkbox handling
            if (this.type === "checkbox") {
              formData[key] = this.checked ? 1 : 0;
              return;
            }

            // Normal fields
            let value = this.value.trim();
            if (value !== "") {
              formData[key] = value;
            }
          });

        $.ajax({
          url: "queries/add.php",
          type: "POST",
          data: JSON.stringify(formData),
          contentType: "application/json",
          dataType: "json",
          xhrFields: { withCredentials: true },
          success(response) {
            if (response.success) {
              alert("Member added successfully!");
              $("#addMemberForm")[0].reset();
            } else {
              alert("Error: " + response.message);
            }
          },
          error(xhr, status, error) {
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
  function renderQuickFilters() {
    // Only create once
    if ($("#quickFilters").length) return;

    const html = `
    <div id="quickFilters" style="display:flex; align-items:center; gap:16px; margin-bottom:10px;">
      <strong>Quick filters:</strong>

      <label style="display:flex; align-items:center; gap:6px;">
        <input type="checkbox" id="qf_bad_email">
        Bad Email
      </label>

      <label style="display:flex; align-items:center; gap:6px;">
        <input type="checkbox" id="qf_deceased">
        Deceased
      </label>

      <button id="applyQuickFilters">Apply</button>
      <button id="clearQuickFilters">Clear</button>
    </div>
  `;

    // Move quick filters **above the bulk toolbar**
    $("#bulkToolbar").before(html);
  }

  function updatePage() {
    if (!paginatedData.pages) return;

    let pageData = paginatedData.pages[myQuery.page] || [];
    renderQuickFilters();
    renderMembers(pageData);
    renderPagination();
  }
  function runQuery() {
    updateSelectedColumns();

    const mainFilters = getFilterValues();

    // Merge persistent quick filters (stored in myQuery.quickFilters)
    myQuery.filters = { ...mainFilters, ...myQuery.quickFilters };

    myQuery.limit = $("#limitInput").val();
    myQuery.perPage = $("#perPageInput").val();
    myQuery.sortColumn = $("#sort").val() || "id";
    myQuery.sortOrder = $("#order").val() || "ASC";
    myQuery.page = myQuery.page || 1;

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
        if (response.status === "success") {
          members = response.members || [];

          // Pagination setup
          createPages(members);

          // Render results table + quick filters + pagination
          updatePage();

          // Render sorting options
          renderSort(members);

          // Always show the results count
          $("#resCount").html(
            `<p class="results-count">This search returned <strong>${members.length}</strong> results.</p>`
          );

          // Show or hide download buttons based on results
          if (members.length > 0) {
            $("#downloadButtons").removeClass("hidden");
          } else {
            $("#downloadButtons").addClass("hidden");
            $("#results").html("<p>No results found.</p>");
          }

          console.log("Query successful:", response);
        } else {
          // Query failed
          members = [];
          createPages(members);
          updatePage();
          $("#resCount").html(
            `<p class="results-count">Search failed: ${response.message}</p>`
          );
          $("#results").html("<p>No results found.</p>");
          $("#downloadButtons").addClass("hidden");
          console.warn("Query failed:", response.message);
        }
      },
      error: function (xhr, status, error) {
        members = [];
        createPages(members);
        updatePage();
        $("#resCount").html(
          `<p class="results-count">Server error. Please try again.</p>`
        );
        $("#results").html("<p>Server error. Please try again.</p>");
        $("#downloadButtons").addClass("hidden");
        console.error("AJAX error:", error);
      },
    });
  }

  $("#searchBtn").click(function () {
    myQuery.page = 1; // reset to first page on a new search
    runQuery();
  });

  $(document).on("click", "#applyQuickFilters", function () {
    myQuery.quickFilters = {};
    if ($("#qf_bad_email").is(":checked"))
      myQuery.quickFilters.Bad_Email = true;
    if ($("#qf_deceased").is(":checked")) myQuery.quickFilters.Deceased = true;

    myQuery.page = 1;
    runQuery();
  });

  $(document).on("click", "#clearQuickFilters", function () {
    $("#qf_bad_email, #qf_deceased").prop("checked", false);
    myQuery.quickFilters = {};
    myQuery.page = 1;
    runQuery();
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
  updateBulkToolbar();
});
