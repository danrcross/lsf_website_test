<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo "<p style='color:red; text-align:center;'>Access denied. Admins only.</p>";
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LSF Member Database</title>
    <script src="https://code.jquery.com/jquery-3.7.1.js"></script>
    <script src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>
    <script src="assets/js/app.js"></script>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
    />

    <link
      rel="stylesheet"
      href="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"
    />
    <link rel="stylesheet" href="assets/css/app.css" />
  </head>
  <body>
    <h1>LSF Member Database</h1>

    <div id="tabs">
      <ul>
        <li><a href="#searchTab">Database</a></li>
        <li><a href="#addMemberTab">Add New Member</a></li>
      </ul>

      <div id="searchTab">
        <h2 class="section-title">Search, Edit, and Delete Members</h2>
        <fieldset>
          <legend>Columns to include</legend>
          <div id="col-sel-ctnr" class="flex-container"></div>
        </fieldset>
        <fieldset>
          <legend>Filter/Search</legend>
          <div id="fil-sch-ctnr" class="flex-container"></div>
        </fieldset>
        <div id="srch-lim-ctnr">
          <fieldset>
            <legend>Limit Results:</legend>

            <label for="limitInput">Total Results:</label>
            <input
              type="number"
              id="limitInput"
              placeholder="Total results"
              value="10"
              min="1"
            />

            <label for="resultsPerPageInput">Results per Page:</label>
            <input
              type="number"
              id="perPageInput"
              placeholder="Results per page"
              value="5"
              min="1"
            />

            <button id="searchBtn">Search</button>
          </fieldset>
        </div>

        <h2>Results:</h2>
        <div id="resultsHeader">
          <p id="resCount"></p>
          <div id="downloadButtons" class="hidden">
            <button id="downloadCSVBtn">
              <i class="fas fa-download"></i> Download CSV
            </button>
            <button id="downloadPDFBtn">
              <i class="fas fa-download"></i> Download PDF
            </button>
          </div>
        </div>

        <div id="sortOptions"></div>
        <!-- inside #searchTab, just above <div id="results"> -->
        <div id="bulkToolbar" class="bulk-toolbar hidden">
          <span id="bulkCount">0 selected</span>
          <button id="bulkEditBtn" disabled>Bulk Edit</button>
          <button id="bulkDeleteBtn" disabled>Bulk Delete</button>
          <button id="clearSelectionBtn">Cancel</button>
        </div>
        <div id="bulkDeleteDialog" style="display: none"></div>
        <div id="bulkEditDialog" style="display: none"></div>
        <div id="results"></div>
        <div id="pagination"></div>
      </div>

      <div id="addMemberTab">
  <h2 class="section-title">Add New Member</h2>
  <form id="addMemberForm"></form>
</div>

    </div>
  </body>
</html>
