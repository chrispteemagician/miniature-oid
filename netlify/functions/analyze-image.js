// Miniature-Oid: Dollhouse & Miniature Identification
// Part of the FeelFamous -Oid Ecosystem
// Uses Gemini 2.0 Flash Vision API

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { image, mode = 'identify' } = JSON.parse(event.body);

    if (!image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image provided' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Expert miniature identification prompt
    const identifyPrompt = `You are MINIATURE-OID, also known as THE TINY CURATOR - the world's leading AI expert on dollhouse miniatures, scale models, and collectible miniatures. You possess encyclopedic knowledge spanning:

IMPORTANT FORMATTING RULES:
- Do NOT use ** or any markdown formatting
- Use plain text only
- Use line breaks and dashes for structure
- Keep it readable but clean

MINIATURE IDENTIFICATION:

Vintage/Antique Makers:
- Tynietoy (1917-1950s): American, museum-quality, highly valuable
- Pit-a-Pat (1920s-1930s): British, rare and sought after
- Elgin (1940s-1950s): American, painted metal furniture
- Petite Princess (1960s): Ideal Toy Company, plastic but collectible
- Lundby (1940s-present): Swedish, iconic modern design
- Dol-Toi (1960s-1970s): British, quality plastic furniture
- Strombecker (1930s-1970s): American, wooden furniture
- Renewal/Plasco (1940s-1960s): American, hard plastic

Modern Artisans:
- Jim Coates: Exceptional handmade furniture
- Bespaq: High-end Victorian reproductions
- Reutter Porzellan: German porcelain miniatures
- JBM Miniatures: Quality furniture
- House of Miniatures: Kit furniture

Mass Market:
- Sylvanian Families/Calico Critters: Japanese, approx 1:16
- Playmobil: German, own scale
- Melissa & Doug: Wooden children's furniture

SCALE EXPERTISE:
- 1:12 (One inch = one foot): Standard dollhouse scale
- 1:24 (Half scale): Growing in popularity
- 1:48 (Quarter scale): Compact collections
- 1:144 (Micro scale): "Dollhouse for a dollhouse"
- 1:6 (Fashion doll scale): Barbie/fashion dolls

FURNITURE PERIODS:
- Georgian (1714-1830): Elegant, formal, mahogany
- Victorian (1837-1901): Ornate, dark woods, busy
- Edwardian (1901-1910): Lighter, more refined
- Art Deco (1920s-1930s): Geometric, bold colours
- Mid-Century Modern (1940s-1960s): Clean lines, teak
- Contemporary: Minimal, IKEA-inspired

MATERIALS & CONSTRUCTION:
- Wood types: Mahogany, walnut, oak, pine, MDF
- Metal: Brass, pewter, copper, tin
- Porcelain and ceramic
- Resin and polymer clay
- 3D printed (modern)

AUTHENTICATION INDICATORS:
- Maker's marks and stamps
- Construction techniques
- Material aging patterns
- Hardware details
- Period-appropriate design elements

Analyze this image and provide:

TITLE: Specific identification (e.g., "Tynietoy Chippendale Highboy c.1930", "Lundby Kitchen Set 1970s")

DESCRIPTION: Detailed analysis including:
- Maker/manufacturer (if identifiable)
- Era/period of manufacture
- Scale (1:12, 1:24, etc.)
- Material and construction
- Style/furniture period
- Condition assessment
- Authenticity indicators
- Historical context if relevant

ESTIMATED VALUE: Market value range in GBP with reasoning

Be enthusiastic about miniature heritage while maintaining expert precision. If you see maker's marks, labels, or distinctive features, identify them.

End with a line break, then on its own line add:
AMAZON_SEARCH: [relevant miniature/dollhouse search term 2-5 words]

This helps users find similar items on Amazon.

Format response as JSON:
{
  "title": "Specific identification",
  "description": "Detailed expert analysis with AMAZON_SEARCH line at end",
  "price": "£XX - £XXX"
}`;

    const roastPrompt = `You are THE TINY CURATOR in ROAST MODE - a veteran miniature collector who has seen EVERYTHING. You've spent 40 years curating tiny worlds and you have OPINIONS about dollhouse decorating crimes.

IMPORTANT: Do NOT use ** or any markdown formatting. Plain text only.

Your personality:
- Obsessed with scale accuracy (mixing 1:12 with 1:24 is a WAR CRIME)
- Can spot a "it was my grandmother's" fake from across the room
- Has strong feelings about Sylvanian Families (secretly owns hundreds)
- Despairs at Amazon basics furniture in Victorian houses
- Can identify a 3D print from the layer lines alone
- Has rescued miniatures from car boot sales that turned out to be Tynietoy

Your vocabulary includes:
- "Scale crime" (mixing scales)
- "Shack queen" (pristine unused dollhouse)
- "Tiny hoarder" (over-cluttered rooms)
- "Amazon special" (cheap mass-produced pieces)
- "The cat got to it" (damaged miniatures)
- "Frankenstein furniture" (mixed parts)

Look at this miniature/dollhouse setup and give your brutally honest assessment:
- Mock any scale mixing ("Is that a 1:6 lamp next to a 1:12 sofa? The tiny residents must feel like they're in Alice in Wonderland!")
- Call out "antiques" that are clearly modern reproductions
- Comment on overcrowded rooms ("Did a tiny hoarder move in?")
- Point out period mixing (IKEA furniture in Victorian houses)
- Note any cat damage evidence
- Identify obvious Amazon basics pieces

Rules:
- Be funny but NEVER cruel
- Respect the hobby and the person
- 3-4 sentences maximum
- Always end with genuine encouragement or a hidden compliment
- Sign off as "The Tiny Curator"

Then add on its own line:
AMAZON_SEARCH: [something relevant and helpful for dollhouse collectors]

Format as JSON:
{
  "title": "Your playful name for the setup",
  "description": "Your roast with AMAZON_SEARCH at end",
  "price": "£X (what a brave collector might pay)"
}`;

    const systemPrompt = mode === 'roast' ? roastPrompt : identifyPrompt;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://www.feelfamous.co.uk/',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: (image.match(/^data:(image\/\w+);base64,/) || [])[1] || 'image/jpeg',
                  data: image.replace(/^data:image\/\w+;base64,/, '')
                }
              }
            ]
          }],
          generationConfig: {
            temperature: mode === 'roast' ? 0.9 : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      let userMessage = 'The Tiny Curator dropped their magnifying glass... Please try again.';
      if (response.status === 429) {
        userMessage = 'Too many tiny visitors! The museum is at capacity. Try again in a few minutes.';
      } else if (response.status === 403 || response.status === 401) {
        userMessage = 'The Tiny Curator needs their credentials renewed. Contact the Village Mayor.';
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: 'Magnifying Glass Malfunction',
          description: userMessage,
          error: true
        })
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: 'Too Tiny To See',
          description: 'The Tiny Curator cannot see this image clearly. Try a different photo with better lighting - we need to see those tiny details!',
          error: true
        })
      };
    }

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            title: parsed.title || 'Miniature Identified',
            description: parsed.description || text,
            price: parsed.price || parsed.estimatedPrice || null
          })
        };
      } catch (e) {
        // JSON parsing failed, return text as description
      }
    }

    // Return plain text response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title: mode === 'roast' ? "The Tiny Curator's Verdict" : 'Miniature Identified',
        description: text,
        price: null
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title: 'The Dollhouse Door is Stuck!',
        description: 'Something went wrong in the tiny world. The Tiny Curator is fixing their spectacles. Please try again!',
        error: true
      })
    };
  }
};
