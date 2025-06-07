$(document).ready(function () {
  $.ajax({
    url: "/queries/dashboard.php",
    method: "GET",
    dataType: "json",
    success: function (data) {
      if (!data.success) {
        $("#dashboard-container").html(
          `<p style="color:red;">${data.message}</p>`
        );
        return;
      }

      window.MEMBER_DATA = data.member || {};
      window.IS_ADMIN = data.role === "admin";
      window.USER_NAME = data.username || "";
      window.USER_EMAIL = data.email || "";

      renderDashboard();
    },
    error: function () {
      $("#dashboard-container").html(
        "<p style='color:red;'>Failed to load dashboard data.</p>"
      );
    },
  });

  function renderDashboard() {
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

    function renderDashboardTabs() {
      const html = `
        <div class="dashboard-tabs">
          <ul class="tab-nav">
            <li class="tab-link active" data-tab="account-settings">Account Settings</li>
            <li class="tab-link" data-tab="member-data">Member Data</li>
            <li class="tab-link" data-tab="contact-admin">Contact Admin</li>
          </ul>
          <div class="tab-content" id="account-settings"></div>
          <div class="tab-content" id="member-data" style="display:none;"></div>
          <div class="tab-content" id="contact-admin" style="display:none;"></div>
        </div>
      `;
      $("#dashboard-container").html(html);
    }

    function renderAccountSettings(username, email) {
      const html = `
        <h3>Account Settings</h3>
        <div class="dashboard-grid">
          <label for="email">Email</label>
          <div style="padding: 8px 0;">${email}</div>

          <label for="username">Username</label>
          <input type="text" id="username" value="${username}" />

          <label for="new_password">New Password</label>
          <input type="password" id="new_password" placeholder="Leave blank to keep current" />

          <label for="confirm_password">Confirm New Password</label>
          <input type="password" id="confirm_password" placeholder="Leave blank to keep current" />

          <div class="dashboard-actions">
            <button id="save-account-settings">Save Changes</button>
          </div>
        </div>
        <div id="account-update-msg" style="margin-top:12px; font-weight:bold;"></div>
      `;

      $("#account-settings").html(html);
    }

    renderDashboardTabs();
    renderAccountSettings(window.USER_NAME, window.USER_EMAIL);

    function renderDashboardMember(member) {
      const isAdmin = window.IS_ADMIN;
      const displayName = member.First_Name
        ? `${member.First_Name}'s`
        : "Member";

      if (!isAdmin) {
        const msg = `
          <h3>${displayName} Member Data</h3>
          <p style="padding: 1em; background: #f9f9f9; border: 1px solid #ccc;">
            To update your member information, please use the <strong>Contact Admin</strong> form.
          </p>`;
        $("#member-data").html(msg);
        return;
      }

      let html = `<h3>${displayName} Member Data</h3><div class="dashboard-grid">`;

      for (const key in member) {
        const label = key.replace(/_/g, " ");
        const value = member[key] ?? "";
        const inputType = dateFields.includes(key) ? "date" : "text";

        html += `<label for="${key}">${label}</label>`;

        if (editableFields.includes(key)) {
          if (["Deceased", "Duplicate"].includes(key)) {
            html += `
              <select id="${key}" name="${key}" class="editable" data-field="${key}" disabled>
                <option value="0" ${value == 0 ? "selected" : ""}>No</option>
                <option value="1" ${value == 1 ? "selected" : ""}>Yes</option>
              </select>
            `;
          } else {
            html += `
              <input type="${inputType}" 
                     id="${key}" 
                     name="${key}" 
                     class="editable" 
                     data-field="${key}" 
                     value="${value}" 
                     disabled />
            `;
          }
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

      $("#member-data").html(html);

      $(".editable")
        .filter((_, el) => el.type === "date")
        .datepicker?.();
    }

    function renderMessageForm(name = "", email = "", showHeading = true) {
      const headingHTML = showHeading ? `<h3>Contact Admin</h3>` : "";
      const html = `
        <div class="user-message-form">
          ${headingHTML}
          <form id="member-request-form" style="margin-top:16px;">
            <label for="full_name">Full Name</label>
            <input type="text" id="full_name" name="full_name" value="${name}" required />

            <label for="contact_email">Email</label>
<input type="email" id="contact_email" name="email" value="${email}" required />


            <label for="note">Message (optional)</label>
            <textarea id="note" name="note" rows="4"></textarea>

            <button type="submit">Send Message</button>
          </form>
          <div id="request-status" style="margin-top:16px; font-weight:bold;"></div>
        </div>
      `;
      $("#contact-admin").html(html);
    }

    function handleFormSubmit() {
      $(document).on("submit", "#member-request-form", function (e) {
        e.preventDefault();
        const payload = {
          full_name: this.full_name.value,
          email: this.contact_email.value,
          note: this.note.value,
        };

        $.ajax({
          url: "/queries/notify_admin.php",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload),
          success: function (result) {
            $("#request-status").text(result.message || "Message sent.");
          },
          error: function () {
            $("#request-status").text("Failed to send message.");
          },
        });
      });
    }

    $(document).on("click", ".edit-btn", function () {
      $(".editable").prop("disabled", false);
      $(".save-btn, .cancel-btn").show();
      $(".edit-btn").hide();
    });

    $(document).on("click", ".cancel-btn", function () {
      renderDashboardMember(member);
    });

    $(document).on("click", ".save-btn", function () {
      const updates = {};
      $(".editable").each(function () {
        const key = $(this).data("field");
        let val = $(this).val().trim();
        if (["Deceased", "Duplicate"].includes(key)) {
          val = parseInt(val);
        }
        updates[key] = val;
      });

      updates["id"] = member.id;

      $.ajax({
        url: "/queries/save_member.php",
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

    $(document).on("click", ".tab-link", function () {
      const tab = $(this).data("tab");
      $(".tab-link").removeClass("active");
      $(this).addClass("active");
      $(".tab-content").hide();
      $("#" + tab).show();
    });

    $(document).on("click", "#save-account-settings", function () {
      const username = $("#username").val().trim();
      const password = $("#new_password").val();
      const confirm = $("#confirm_password").val();

      if (password && password !== confirm) {
        $("#account-update-msg").text("Passwords do not match.");
        return;
      }

      const payload = { username };
      if (password) payload.password = password;

      $.ajax({
        url: "/queries/update_account.php",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function (res) {
          if (res.success) {
            $("#account-update-msg").text("Account updated successfully.");
          } else {
            $("#account-update-msg").text("Error: " + res.message);
          }
        },
        error: function () {
          $("#account-update-msg").text("Failed to update account.");
        },
      });
    });

    renderDashboardMember(member);
    renderMessageForm(
      `${member.First_Name || ""} ${member.Last_Name || ""}`.trim(),
      member.email || ""
    );
    handleFormSubmit();
  }
});
