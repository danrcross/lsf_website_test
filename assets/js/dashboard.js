$(document).ready(function () {
  const member = window.MEMBER_DATA || {};
  const isAdmin = window.IS_ADMIN;

  const dateFields = [
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
    "SAP_Aspirant",
    "eSAP_Aspirant",
    "Last_Contact",
  ];

  const editableFields = isAdmin
    ? Object.keys(member).filter((key) => key !== "id")
    : [
        "First_Name",
        "Last_Name",
        "email",
        "Address",
        "City",
        "State",
        "Zip",
        "Country",
      ];

  function renderDashboardMember(data) {
    const name = member.First_Name || "User";
    const dashboardHeader = `<h2 style="text-align:center;">${name}'s Dashboard</h2>`;
    const nonEditable = ["SAP_Level", "eSAP_Level"];
    const editableFields = window.IS_ADMIN
      ? Object.keys(member).filter((key) => key !== "id")
      : [
          "First_Name",
          "Last_Name",
          "email",
          "Address",
          "City",
          "State",
          "Zip",
          "Country",
        ];

    let output = `
    ${dashboardHeader}
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Actions</th>
  `;

    Object.keys(data).forEach((key) => {
      output += `<th>${key.replace(/_/g, " ")}</th>`;
    });

    output += `</tr></thead><tbody><tr>`;

    // Action buttons
    output += `
      <td>
        <button class="edit-btn">Edit</button>
        <button class="save-btn" style="display:none;">Save</button>
        <button class="cancel-btn" style="display:none;">Cancel</button>
      </td>`;

    // Data cells
    Object.keys(data).forEach((key) => {
      const val = data[key] ?? "";
      if (editableFields.includes(key)) {
        const isDate = dateFields.includes(key);
        output += `<td class="editable" data-field="${key}">
          <input type="text" value="${val}" ${
          isDate ? 'class="datepicker"' : ""
        } disabled />
        </td>`;
      } else {
        output += `<td>${val}</td>`;
      }
    });

    output += `</tr></tbody></table></div>`;
    $("#dashboard-container").html(output);

    // Initialize datepickers
    $(".datepicker").datepicker({
      dateFormat: "yy-mm-dd",
      changeMonth: true,
      changeYear: true,
      yearRange: "1950:2050",
    });
  }

  // --- Event Handlers ---

  $(document).on("click", ".edit-btn", function () {
    $(".editable input").prop("disabled", false);
    $(".save-btn, .cancel-btn").show();
    $(".edit-btn").hide();
  });

  $(document).on("click", ".cancel-btn", function () {
    renderDashboardMember(window.MEMBER_DATA);
  });

  $(document).on("click", ".save-btn", function () {
    const updates = {};
    $(".editable").each(function () {
      const key = $(this).data("field");
      const val = $(this).find("input").val().trim();
      updates[key] = val;
    });

    updates["id"] = window.MEMBER_DATA.id;

    $.ajax({
      url: "queries/save_member.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(updates),
      success: function (res) {
        if (res.success) {
          alert("Profile updated successfully.");
          location.reload();
        } else {
          alert("Error: " + res.message);
        }
      },
      error: function () {
        alert("Failed to save changes.");
      },
    });
  });

  renderDashboardMember(member);
});
