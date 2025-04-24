import { NextResponse } from "next/server";

export const revalidate = 0; // Disable cache for this route

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Log the URL for debugging purposes
    console.log("Proxying URL:", url);

    // Validate URL is properly formed
    let targetUrl;
    try {
      targetUrl = new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Security checks - only allow certain domains if needed
    // const allowedDomains = ['example.com', 'trusted-domain.com'];
    // if (!allowedDomains.some(domain => targetUrl.hostname.includes(domain))) {
    //   return NextResponse.json(
    //     { error: 'Domain not allowed' },
    //     { status: 403 }
    //   );
    // }

    // Fetch the content from the external URL
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch content: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get content type
    const contentType = response.headers.get("content-type") || "text/html";

    // For HTML content, we need to proxy resources and rewrite links
    if (contentType.includes("text/html")) {
      let html = await response.text();

      // Base URL for resolving relative paths
      const baseUrl = new URL(url);

      // Replace relative URLs in src and href attributes
      html = html.replace(
        /(src|href)=["'](?!http|\/\/|data:|#|javascript:|mailto:)([^"']+)["']/gi,
        (match, attr, path) => {
          try {
            const absoluteUrl = new URL(path, baseUrl.origin).toString();
            return `${attr}="${absoluteUrl}"`;
          } catch (e) {
            // If URL construction fails, return the original
            return match;
          }
        }
      );

      // Replace relative URLs in CSS
      html = html.replace(
        /url\(['"]?(?!http|\/\/|data:|#)([^'")]+)['"]?\)/gi,
        (match, path) => {
          try {
            const absoluteUrl = new URL(path, baseUrl.origin).toString();
            return `url("${absoluteUrl}")`;
          } catch (e) {
            // If URL construction fails, return the original
            return match;
          }
        }
      );

      // Add base tag to head
      html = html.replace(/<head>/, `<head><base href="${baseUrl.origin}/" />`);

      // Add CSP meta tag to allow loading resources
      html = html.replace(
        /<head>/,
        `<head><meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;" />`
      );

      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Proxy-Source": url,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // For other content types, pass through directly
    const data = await response.arrayBuffer();
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "X-Proxy-Source": url,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request", message: (error as Error).message },
      { status: 500 }
    );
  }
}
