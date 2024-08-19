document.getElementById("copyButton").addEventListener("click", function() {
    const svgElement = document.querySelector("#chart-0-container svg");
  
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
  
      // Generate HTML embed code
      const embedCode = `<img src="${url}" alt="Chart" />`;
  
      // Copy the embed code to the clipboard
      navigator.clipboard.writeText(embedCode).then(() => {
        alert("Embed code copied to clipboard! You can download the SVG and use the copied HTML in your README.");
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
  
      // Offer a download link for the SVG
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "chart.svg";
      downloadLink.textContent = "Download SVG";
      document.body.appendChild(downloadLink);
    } else {
      alert("No SVG found to copy!");
    }
  });
  