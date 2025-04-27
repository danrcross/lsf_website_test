$(document).ready(function () {
  console.log("swTab open");

  $.ajax({
    url: "queries/SAP5s.php",
    type: "GET",
    dataType: "json", // expect JSON response
    success: function (response) {
      console.log("Response:", response);

      let rowsHtml = "";

      response.forEach((member, i) => {
        const firstName = member.First_Name.toUpperCase();
        const lastName = member.Last_Name.toUpperCase();
        const location = member.State
          ? `${member.State}, ${member.Country}`
          : member.Country;
        const dateObj = new Date(member.SAP_Level_5);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        rowsHtml += `
          <tr>
            <td>${i + 1}</td>
            <td>${firstName} ${lastName}</td>
            <td>${member.LSF_Number}</td>
            <td>${location}</td>
            <td>${formattedDate}</td>
          </tr>
        `;
      });

      $("#headerSAP5").after(rowsHtml);
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });

  $.ajax({
    url: "queries/eSAP5s.php",
    type: "GET",
    dataType: "json", // expect JSON response
    success: function (response) {
      console.log("Response:", response);

      let rowsHtml = "";

      response.forEach((member, i) => {
        const firstName = member.First_Name.toUpperCase();
        const lastName = member.Last_Name.toUpperCase();
        const location = member.State
          ? `${member.State}, ${member.Country}`
          : member.Country;

        const dateObj = new Date(member.eSAP_Level_5);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        rowsHtml += `
          <tr>
            <td>${i + 1}</td>
            <td>${firstName} ${lastName}</td>
            <td>${member.LSF_Number}</td>
            <td>${location}</td>
            <td>${formattedDate}</td>
          </tr>
        `;
      });

      $("#headerESAP5").after(rowsHtml);
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
    },
  });
});
