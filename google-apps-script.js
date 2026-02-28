/**
 * Google Apps Script for Bear Functional Booking
 * 
 * Instructions:
 * 1. Open a Google Sheet.
 * 2. Go to Extensions -> Apps Script.
 * 3. Delete existing code and paste this.
 * 4. Rename 'Sheet1' to 'Calendar' and create a second sheet named 'Stats'.
 * 5. Deployment -> New Deployment -> Web App.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL and paste it into script.js (SCRIPT_URL variable).
 */

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        // 1. Calendar Sheet
        var calendarSheet = ss.getSheetByName('Calendar');
        if (!calendarSheet) {
            calendarSheet = ss.insertSheet('Calendar');
            calendarSheet.appendRow(['Date', 'Workout', 'Name', 'Phone', 'Timestamp']);
        }

        // Split workoutDetails: "2026-02-27 | Strength Foundations | 13:00"
        var details = data.workoutDetails.split(' | ');
        var date = details[0];
        var workout = details[1];
        var time = details[2];

        calendarSheet.appendRow([date + ' ' + time, workout, data.name, data.phone, new Date()]);

        // 2. Stats Sheet
        var statsSheet = ss.getSheetByName('Stats');
        if (!statsSheet) {
            statsSheet = ss.insertSheet('Stats');
            statsSheet.appendRow(['Name', 'Phone', 'Attendance Count']);
        }

        var statsData = statsSheet.getDataRange().getValues();
        var found = false;
        for (var i = 1; i < statsData.length; i++) {
            if (statsData[i][1] == data.phone) { // Match by phone
                var newCount = statsData[i][2] + 1;
                statsSheet.getRange(i + 1, 3).setValue(newCount);
                found = true;
                break;
            }
        }

        if (!found) {
            statsSheet.appendRow([data.name, data.phone, 1]);
        }

        // Sort Stats by Attendance (Column 3) Descending
        var lastRow = statsSheet.getLastRow();
        if (lastRow > 1) {
            statsSheet.getRange(2, 1, lastRow - 1, 3).sort({ column: 3, ascending: false });
        }

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}
