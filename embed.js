document.getElementById("copyButton").addEventListener("click", async function() {
    const svgElement = document.querySelector("#chart-0-container");
  
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
  
      const formData = new FormData();
      formData.append("file", blob, "chart.svg");
  
      try {
        const response = await fetch("https://file.io", {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();
  
        if (result.success) {
          const imageUrl = result.link;
  
          // Generate HTML embed code
          const embedCode = `<img src="${imageUrl}" alt="Chart" />`;
  
          // Copy the embed code to the clipboard
          navigator.clipboard.writeText(embedCode).then(() => {
            alert("Embed code copied to clipboard!");
          }).catch(err => {
            console.error('Failed to copy text: ', err);
          });
        } else {
          alert("Failed to upload image to File.io.");
        }
      } catch (error) {
        console.error('Error uploading image: ', error);
      }
    } else {
      alert("No SVG found to copy!");
    }
  });
  