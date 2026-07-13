document.getElementById('checkBtn').addEventListener('click', async () => {
  // Get the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) return;

  // Execute our scanning and highlighting logic inside the active webpage
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: highlightDuplicateIds
  });
});

// This function executes directly inside the context of the webpage
function highlightDuplicateIds() {
  const allElementsWithId = document.querySelectorAll('[id]');
  const idCounts = {};
  const duplicates = {};

  // Count occurrences of each ID
  allElementsWithId.forEach(element => {
    const id = element.id.trim();
    if (id) {
      if (idCounts[id]) {
        idCounts[id].push(element);
      } else {
        idCounts[id] = [element];
      }
    }
  });

  // Isolate the duplicates
  for (const id in idCounts) {
    if (idCounts[id].length > 1) {
      duplicates[id] = idCounts[id];
    }
  }

  const duplicateKeys = Object.keys(duplicates);

  if (duplicateKeys.length === 0) {
    alert("No duplicate IDs found on this page!");
    console.log("%c No duplicate IDs found!", "color: green; font-weight: bold;");
    return;
  }

  // Highlight and log duplicates
  console.error(`%c Found ${duplicateKeys.length} duplicate ID(s)!`, "font-weight: bold;");
  
  duplicateKeys.forEach(id => {
    console.group(`ID: "${id}" (appears ${duplicates[id].length} times)`);
    
    duplicates[id].forEach((element, index) => {
      // Apply a thick red border and a slight soft glow for high visibility
      element.style.outline = "3px solid red";
      element.style.outlineOffset = "2px"; 
      // Note: We use 'outline' instead of 'border' so it doesn't shift your layout elements!
      
      console.log(`Occurrence ${index + 1}:`, element);
    });
    
    console.groupEnd();
  });

  alert(`Found ${duplicateKeys.length} duplicate ID(s). Check the developer console for details and look for red outlines on the page!`);
}