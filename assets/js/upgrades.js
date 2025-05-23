$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const year = urlParams.get("year") || new Date().getFullYear(); // fallback to current year

  $("#yearTitle").text(`${year} Upgrades`);
  $("#prevYearBtn").click(
    () => (location.href = `/pages/upgrades.htm?year=${parseInt(year) - 1}`)
  );
  $("#nextYearBtn").click(
    () => (location.href = `/pages/upgrades.htm?year=${parseInt(year) + 1}`)
  );

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (d instanceof Date && !isNaN(d)) {
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
    return "";
  }

  $.ajax({
    url: `/queries/upgrades.php?year=${year}`,
    type: "GET",
    dataType: "json",
    success: function (response) {
      const sapMembers = [];
      const esapMembers = [];

      response.forEach((member) => {
        const sapDate = member.latest_sap_date;
        const esapDate = member.latest_esap_date;

        if (sapDate && sapDate.startsWith(year)) sapMembers.push(member);
        if (esapDate && esapDate.startsWith(year)) esapMembers.push(member);
      });

      sapMembers.forEach((m) => {
        $("#headerSAP").after(`
    <tr>
      <td>${m.LSF_Number || ""}</td>
      <td>${m.First_Name?.toUpperCase() || ""} ${
          m.Last_Name?.toUpperCase() || ""
        }</td>
      <td>${m.State || ""}</td>
      <td>${m.Country || ""}</td>
      <td>${m.latest_sap_level?.replace("SAP Level ", "") || ""}</td>
      <td>${formatDate(m.latest_sap_date) || ""}</td>
    </tr>
  `);
      });

      esapMembers.forEach((m) => {
        $("#headerESAP").after(`
    <tr>
      <td>${m.LSF_Number || ""}</td>
      <td>${m.First_Name?.toUpperCase() || ""} ${
          m.Last_Name?.toUpperCase() || ""
        }</td>
      <td>${m.State || ""}</td>
      <td>${m.Country || ""}</td>
      <td>${m.latest_esap_level?.replace("eSAP Level ", "") || ""}</td>
      <td>${formatDate(m.latest_esap_date) || ""}</td>
    </tr>
  `);
      });
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });
});
