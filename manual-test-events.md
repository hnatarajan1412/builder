# Manual Test for Event Handlers in Preview Mode

## Test Steps

1. Open http://localhost:3005 in your browser
2. Create a new app called "Event Test"
3. Add a Button component
4. Select the button and go to the Events tab
5. Click "Add Action"
6. Configure the action:
   - Trigger Event: onClick
   - Action Type: showAlert
   - Alert Message: "Button clicked!"
7. Click Preview
8. Click the button - you should see an alert

## What's Fixed

1. **Event Handler Mapping**: Events are now properly mapped from the component configuration to React event handlers
2. **Event Name Conversion**: Event names like "onClick" are properly handled (already starting with "on")
3. **Support for Different Event Formats**: The system now supports both old format (action/parameters) and new format (type/config)
4. **Visual Feedback**: Added notification system to show when events are triggered in preview mode
5. **Form Event Handling**: Form components now render as `<form>` tags with proper event prevention

## Event Types Supported

- **navigate**: Shows notification about navigation
- **state**: Updates page state and shows notification
- **database**: Shows notification about database operation
- **visibility**: Shows notification about visibility change
- **api/apiCall**: Shows notification about API call
- **showAlert**: Shows browser alert
- **custom**: Shows notification about custom action

## Debugging

Open browser console to see detailed event logs when actions are triggered.