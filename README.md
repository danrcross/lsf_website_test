# LSF Database Manager

## [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Summary

This LSF Database Manager application is designed for administrative members of the League of Silent Flight (LSF).

This application presents an intuitive user-interface which will simplify access and operations on the LSF's member database.

Admins can use this to create, read, update, and delete members from the database.

Search tool allows for column selection (i.e. Name, Location, etc.), advanced filtering (by specific name, zip code, etc.), and sorting (ascending/descending) by column.

Displayed results (member entries) are both easily editable and deletable.

The "Add New Member" tab allows for the creation of a new member entry.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributions](#contributions)
- [License](#license)

## Installation

Navigate to [current GoDaddy hosting domain](http://kml.b15.mytemp.website/)

Select the "Member Database Manager" tab on the navigation bar at the top of the page.

## Usage

Below, I give a text/image-based overview of the web application.

For a quicker overview of the application, [click this link to the video tutorial.](https://drive.google.com/file/d/1EVbvhd5h-W7AWF_we69wSMBcp1R_9raa/view?usp=drive_link)

---

Here is the landing page for [http://kml.b15.mytemp.website/](http://kml.b15.mytemp.website/)

![homepage](assets/screenshots/readme-5-11/database-tab.png)

The first thing we can see is the column selection tool. I might choose to limit which columns I want displayed in my results:

![col-select](assets/screenshots/readme-5-11/column-select.png)

Below this section are the filter/search options. By clicking on the "LSF Number [Down Arrow]" tab, we can expand this section. The left slider selects the lower limit, and the right the upper limit. Here we are searching for members from LSF # 1248 to LSF # 4439.

![lsf-range](assets/screenshots/readme-5-11/lsf-range-select.png)

The checkbox must be selected in order to apply the range filter, like so.

![apply-lsf-range](assets/screenshots/readme-5-11/apply-range-filt.png)

These sections are pretty straightforward-- you may simply type the text you are filtering for in each section.

![ama-name-loc-search](assets/screenshots/readme-5-11/ama-name-loc-search.png)

Some dropdown menus retrieve their options from the database, such as the dropdown menu for "Country Coordinator":

![dynamic-dropdown](assets/screenshots/readme-5-11/dynamic-dropdown.png)

The remaining dropdown menus are also straightforward:

![remaining-dropdowns](assets/screenshots/readme-5-11/remaining-dropdowns.png)

We can search for living members by selecting "False" for "Deceased".

Also, note the "Reset Filters" button. This simply removes any text, dropdown selection, etc. It is a fresh start for the Filter/Search section.

![not-deceased](assets/screenshots/readme-5-11/not-deceased.png)

The "limit results" section allows you to limit the total # of results, as well as the # of results per page. By default, the "total results" is set to the current total number of members in the database.

In this example, I will leave the "total results" as the default, and set the "results per page" to "50".
![limit-results](assets/screenshots/readme-5-11/limit-results.png)

After pressing the green "search" button, the page returns my results. My search-- filtering by the selected LSF # range as well as including only living members-- returned 3192 results, as we can see directly below "Results:".

In this image, we can also see:

- the "Download CSV" and "Download PDF" buttons, to the right,
- below the # results returned, a "sort by" feature,
- below the "sort by" feature, a bulk edit/delete tool,
- at the leftmost header of the table, a "select all" checkbox,
- in the leftmost column of each member entry, a "select" checkbox,
- in the column to the right of the checkbox, 3 buttons: "edit", "delete", and "verify address",
- and, of course, the results (members)

I will explain these features in detail below

![search-returned](assets/screenshots/readme-5-11/search-returned.png)

Pressing the "Download CSV" button will trigger a download of a CSV (spreadsheet) file containing the data produced by my search results. It can be found here, at the downloads button on my toolbar (Google Chrome)
![csv-dld](assets/screenshots/readme-5-11/csv-dld.png)

Opening the file should show a spreadsheet (in your default .csv application) that looks like this:

![csv-open](assets/screenshots/readme-5-11/csv-open.png)

The "Download PDF" button works similarly, but should result in a PDF file that looks like the image below. (Note that only the columns which I initially selected for my search are included in the CSV and PDF.)

![pdf-open](assets/screenshots/readme-5-11/pdf-open.png)

If I choose to sort by "SAP Level", "Descending" and hit the sort button, my results will sort the members of my search, showing SAP Level 5 members first.

![sort-results](assets/screenshots/readme-5-11/sort-results.png)

If I scroll to the bottom of the page, I have a page navigation tool. I can hit "next" or "previous" to navigate by one page at a time, or I can use the dropdown menu to jump to a specific page.

![pagination](assets/screenshots/readme-5-11/pagination.png)

By navigating to the last page, I can see the lowest SAP-level members among this set.

![last-page](assets/screenshots/readme-5-11/last-page.png)

If I click a green "Verify Address" button to the left of an entry, a query is made to Google Maps to check the validity of that member's address.
![verify-add](assets/screenshots/readme-5-11/verify-add.png)

Before demonstrating the "Edit", "Delete", "Bulk Edit", and "Bulk Delete" features, I will demonstrate the "Add New Member" tool. This way, I can create some fake members to be edited and deleted-- without being destructive to the existing database.

To use the "Add New Member" tool, I will navigate to the top of the page and click on the "Add New Member" tab, under the "LSF Member Database" heading:

![add-member](assets/screenshots/readme-5-11/add-member.png)

The tabs on the page are collapsable for the sake of visual simplicity. I can click on the tab header to expand that section.

I will start with the LSF Number tab. You can see that there is a green button that says "Use Next LSF #". This queries the database to find the lowest available LSF #.

![lsf-num-open](assets/screenshots/readme-5-11/lsf-num-open.png)

Currently, that number is "8330", so this appears in the text box after the button is clicked.

![lsf-num-next](assets/screenshots/readme-5-11/lsf-num-next.png)

For these examples, though, I will use much higher, unused numbers.

These 3 tabs use simple text entry.

![text-tabs](assets/screenshots/readme-5-11/text-tabs.png)

Dates for SAP/eSAP acheivements can be entered using the datepicker widgets.

![datepickers](assets/screenshots/readme-5-11/datepickers.png)

Lastly, the "Miscellaneous" tab has a text box for miscellaneous information, and dropdown menus for "Deceased" and "Duplicate"

![misc-tab](assets/screenshots/readme-5-11/misc-tab.png)

When the green "Add Member" button is clicked, a dialog box will appear at the top of the page confirming the addition.

![added](assets/screenshots/readme-5-11/added.png)

I added three example members. Each has the zip code "99999". Let's now go back to the database where we can see an example of a false address, as well as edit and delete these members.

I want to view and edit the location of these members, so I will select these columns for viewing. I assume these are the only members with the zip code "99999", so I will use this for my sole search criterion.

![fake-search](assets/screenshots/readme-5-11/fake-search.png)

The search successfully returned these 3 members

![3-res](assets/screenshots/readme-5-11/3-res.png)

When I clicked the "Verify Address" button, it returned valid. This is not a truly valid address, but I can see the address returned by Google and determine that this is not a true match, but something similar.

![fake-address](assets/screenshots/readme-5-11/fake-address.png)

When I click the edit button to the left of my first result, it appears like this. Some fields become editable. The blue "Cancel" button allows me to cancel the edits, and "Save" allows me to save my edits.

![edit-active](assets/screenshots/readme-5-11/edit-active.png)

I will change the name of the city:

![edit-made](assets/screenshots/readme-5-11/edit-made.png)

And hit save, which opens a confirmation dialog box:

![confirm-save](assets/screenshots/readme-5-11/confirm-save.png)

I can see that the edit has taken effect:

![edit-done](assets/screenshots/readme-5-11/edit-done.png)

Now I will hit delete for this entry, which will display a confirmation dialog box:

![confirm-delete](assets/screenshots/readme-5-11/confirm-delete.png)

Now it is gone, and I have clicked the checkbox in the upper left corner of the table, which selects all entries on the current page (2 entries in this case):

![select-all](assets/screenshots/readme-5-11/select-all.png)

We can see that above the table the Bulk tool has options for "Bulk Edit", "Bulk Delete", and "Cancel". Cancel will simply deselect all checked entries.

We will click "Bulk Edit" first, which activates a form where we can enter the data we would like to change for all selected entries. I will change the name of the "Country Coordinator" to "Maestro":

![bulk-edit](assets/screenshots/readme-5-11/bulk-edit.png)

When I hit save, a confirmation box appears:

![conf-bulk-edit](assets/screenshots/readme-5-11/conf-bulk-edit.png)

I can then hit "OK", and then click the "X" at the top right of the "Bulk Edit" form to close the tool.

We can now see the changes reflected on our entries-- "Maestro" is the name of their Country Coordinator:

![maestro](assets/screenshots/readme-5-11/maestro.png)

I can now select both entries as I did before and hit "Bulk Delete". This will bring up a confirmation dialog box. I can simply hit "Delete" to delete the 2 records.

![conf-bulk-del](assets/screenshots/readme-5-11/conf-bulk-del.png)

Now, after searching for the zip "99999", 0 results are returned!

![no-results](assets/screenshots/readme-5-11/no-results.png)

## License

This application is covered under the [MIT](https://opensource.org/licenses/MIT) license.

## Contributions

Thank you to Ed Dumas for getting me oriented with this web development framework-- with cPanel, phpMyAdmin, and setting up a basic php/html site.

## Questions

Please send me an email or text (your preference) if you have any questions.

[Email](mailto:danrcross@gmail.com)
Cell: 865-924-9851
