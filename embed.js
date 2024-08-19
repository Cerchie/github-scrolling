document.getElementById("copyButton").addEventListener("click", function() {
    // Get the generated SVG element by its ID
    const svgElement = document.querySelector("#chart-0-container svg");
  
    if (svgElement) {
      // Serialize the SVG to a string
      const svgString = new XMLSerializer().serializeToString(svgElement);
      
      // Encode the SVG string as a data URI
      const svgDataUri = 'data:image/svg+xml;base64,' + btoa(svgString);
      
      // Generate the Markdown embed code
      const embedCode = `![Chart]( ${svgDataUri} )`;
  
      // Copy the embed code to the clipboard
      navigator.clipboard.writeText(embedCode).then(() => {
        alert("Embed code copied to clipboard!");
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    } else {
      alert("No SVG found to copy!");
    }
  });
  