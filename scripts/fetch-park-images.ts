import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

// List of all US National Parks
const parks = [
  "Acadia", "American Samoa", "Arches", "Badlands", "Big Bend", "Biscayne",
  "Black Canyon of the Gunnison", "Bryce Canyon", "Canyonlands", "Capitol Reef",
  "Carlsbad Caverns", "Channel Islands", "Congaree", "Crater Lake", "Cuyahoga Valley",
  "Death Valley", "Denali", "Dry Tortugas", "Everglades", "Gates of the Arctic",
  "Gateway Arch", "Glacier", "Glacier Bay", "Grand Canyon", "Grand Teton",
  "Great Basin", "Great Sand Dunes", "Great Smoky Mountains", "Guadalupe Mountains",
  "Haleakalā", "Hawaii Volcanoes", "Hot Springs", "Indiana Dunes", "Isle Royale",
  "Joshua Tree", "Katmai", "Kenai Fjords", "Kings Canyon", "Kobuk Valley", "Lake Clark",
  "Lassen Volcanic", "Mammoth Cave", "Mesa Verde", "Mount Rainier", "New River Gorge",
  "North Cascades", "Olympic", "Petrified Forest", "Pinnacles", "Redwood",
  "Rocky Mountain", "Saguaro", "Sequoia", "Shenandoah", "Theodore Roosevelt",
  "Virgin Islands", "Voyageurs", "White Sands", "Wind Cave", "Wrangell-St. Elias",
  "Yellowstone", "Yosemite", "Zion"
];

/**
 * Fetches the main image URL from a Wikipedia page 
 */
async function fetchWikipediaImage(parkName: string): Promise<string | null> {
  try {
    // Format park name for Wikipedia URL
    const formattedName = parkName.replace(/ /g, '_') + '_National_Park';
    const url = `https://en.wikipedia.org/wiki/${formattedName}`;
    
    console.log(`Fetching ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // Try alternative formatting for special cases
      const alternativeFormattedName = parkName.replace(/ /g, '_');
      const alternativeUrl = `https://en.wikipedia.org/wiki/${alternativeFormattedName}_National_Park`;
      console.log(`Retrying with ${alternativeUrl}`);
      
      const alternativeResponse = await fetch(alternativeUrl);
      if (!alternativeResponse.ok) {
        console.log(`Failed to fetch Wikipedia page for ${parkName}`);
        return null;
      }
      
      const alternativeHtml = await alternativeResponse.text();
      const $alt = cheerio.load(alternativeHtml);
      const altImageUrl = $alt('.infobox-image img').attr('src');
      
      if (altImageUrl) {
        // Wikipedia images start with // so add https:
        return 'https:' + altImageUrl;
      }
      
      return null;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Get the main image URL from the infobox
    const imageUrl = $('.infobox-image img').attr('src');
    
    if (imageUrl) {
      // Wikipedia images start with // so add https:
      return 'https:' + imageUrl;
    }
    
    // If no infobox image, try to get the first image in the article
    const firstImage = $('img.thumbimage').first().attr('src');
    if (firstImage) {
      return 'https:' + firstImage;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching image for ${parkName}:`, error);
    return null;
  }
}

/**
 * Main function to fetch and save park images
 */
async function fetchParkImages() {
  console.log('Starting image fetch for all national parks...');
  
  const parkImageUrls = new Map<string, string>();
  
  // Process parks sequentially to avoid rate limiting
  for (const park of parks) {
    const imageUrl = await fetchWikipediaImage(park);
    if (imageUrl) {
      console.log(`Found image for ${park}: ${imageUrl}`);
      parkImageUrls.set(park, imageUrl);
    } else {
      console.log(`No image found for ${park}`);
    }
    
    // Add a small delay between requests to be respectful to Wikipedia
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save the results to a JSON file for reference
  const outputPath = path.join(__dirname, '../park-images.json');
  await fs.writeFile(
    outputPath, 
    JSON.stringify(Object.fromEntries(parkImageUrls), null, 2)
  );
  
  console.log(`Saved park images to ${outputPath}`);
  
  // Generate TypeScript code for updating the storage.ts file
  let updateCode = 'Update the imageUrl fields in storage.ts with these values:\n\n';
  
  parkImageUrls.forEach((url, name) => {
    updateCode += `${name}: "${url}",\n`;
  });
  
  const codeOutputPath = path.join(__dirname, '../park-images-code.txt');
  await fs.writeFile(codeOutputPath, updateCode);
  
  console.log(`Saved code for updating storage.ts to ${codeOutputPath}`);
}

// Execute the function
fetchParkImages().catch(console.error);