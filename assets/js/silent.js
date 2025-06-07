$(document).ready(function () {
  $.ajax({
    url: "/queries/silentwings.php",
    type: "GET",
    dataType: "json", // expect JSON response
    success: function (response) {
      console.log("Response:", response);

      let rowsHtml = "";

      response.forEach((member) => {
        const firstName = member.First_Name.toUpperCase();
        const lastName = member.Last_Name.toUpperCase();

        const fullLevel =
          member.eSAP_Level && member.eSAP_Level !== 0
            ? `${member.SAP_Level} (${member.eSAP_Level})`
            : member.SAP_Level;

        rowsHtml += `
          <tr>
            <td>${member.LSF_Number}</td>
            <td>${firstName}</td>
            <td>${lastName}</td>
            <td>${fullLevel}</td>
          </tr>
        `;
      });

      $("#header").after(rowsHtml);
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });
});
