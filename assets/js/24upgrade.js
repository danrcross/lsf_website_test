$(document).ready(function () {
  // test js link to html page
  console.log("2024 page open");

  $.ajax({
    url: "queries/2024_upgrades.php",
    type: "GET",
    dataType: "json", // expect JSON response
    success: function (response) {
      console.log("Response:", response);

      const sapMembers = [];
      const esapMembers = [];

      response.forEach((member) => {
        const sapDate = member.latest_sap_date;
        const esapDate = member.latest_esap_date;

        if (sapDate && sapDate.startsWith("2024")) {
          sapMembers.push(member);
        }

        if (esapDate && esapDate.startsWith("2024")) {
          esapMembers.push(member);
        }
      });

      sapMembers.forEach((member) => {
        const row = `
    <tr>
      <td>${member.LSF_Number || ""}</td>
      <td>${member.First_Name?.toUpperCase() || ""} ${
          member.Last_Name?.toUpperCase() || ""
        }</td>
      <td>${member.State || ""}</td>
      <td>${member.Country || ""}</td>
      <td>${member.latest_sap_level?.replace("SAP Level ", "") || ""}</td>
    </tr>
  `;
        $("#headerSAP24").after(row);
      });

      esapMembers.forEach((member) => {
        const row = `
    <tr>
      <td>${member.LSF_Number || ""}</td>
      <td>${member.First_Name?.toUpperCase() || ""} ${
          member.Last_Name?.toUpperCase() || ""
        }</td>
      <td>${member.State || ""}</td>
      <td>${member.Country || ""}</td>
      <td>${member.latest_esap_level?.replace("eSAP Level ", "") || ""}</td>
    </tr>
  `;
        $("#headerESAP24").after(row);
      });

      // Do whatever you want next with sapMembers and esapMembers...
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });
});
