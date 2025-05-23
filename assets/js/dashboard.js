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

  function renderDashboardMember(member) {
    const editable = window.IS_ADMIN
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

    let html = `<h2 style="text-align:center">${member.First_Name}'s Dashboard</h2>`;
    html += `<div class="dashboard-grid">`;

    for (const key in member) {
      const label = key.replace(/_/g, " ");
      const value = member[key] ?? "";
      const inputType = dateFields.includes(key) ? "date" : "text";

      html += `<label for="${key}">${label}</label>`;

      if (editable.includes(key)) {
        html += `
              <input type="${inputType}" 
                     id="${key}" 
                     name="${key}" 
                     class="editable" 
                     data-field="${key}" 
                     value="${value}" 
                     disabled />
            `;
      } else {
        html += `<div style="padding:8px 0">${value}</div>`;
      }
    }

    html += `
          <div class="dashboard-actions">
            <button class="edit-btn">Edit</button>
            <button class="save-btn" style="display:none;">Save</button>
            <button class="cancel-btn" style="display:none;">Cancel</button>
          </div>
        </div>`;

    $("#dashboard-container").html(html);

    $(".editable")
      .filter((_, el) => el.type === "date")
      .datepicker?.(); // if jQuery UI loaded
  }

  // --- Event Handlers ---

  $(document).on("click", ".edit-btn", function () {
    $(".editable").prop("disabled", false);
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
      const val = $(this).val().trim();
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
