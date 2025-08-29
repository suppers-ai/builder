#!/bin/bash

echo "Testing HTMX Navigation"
echo "======================="
echo ""

# Test sequential navigation with HTMX headers
for route in dashboard users database storage settings logs; do
    echo -n "Testing HTMX navigation to /$route: "
    STATUS=$(curl -s -b cookies.txt -H "HX-Request: true" http://localhost:8091/$route -o /dev/null -w "%{http_code}")
    if [ "$STATUS" = "200" ]; then
        # Check if response contains the main-content ID
        HAS_ID=$(curl -s -b cookies.txt -H "HX-Request: true" http://localhost:8091/$route | grep -c 'id="main-content"')
        if [ "$HAS_ID" -gt 0 ]; then
            echo "✓ (HTTP $STATUS, has #main-content)"
        else
            echo "✗ (HTTP $STATUS, missing #main-content)"
        fi
    else
        echo "✗ (HTTP $STATUS)"
    fi
done

echo ""
echo "All navigation tests completed!"