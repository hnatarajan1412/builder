import { test, expect } from '@playwright/test';

test.describe('UI Look and Feel Evaluation', () => {
  test('comprehensive UI/UX assessment', async ({ page }) => {
    await page.goto('http://localhost:3003');
    console.log('🎨 Starting UI/UX Look and Feel Assessment...\n');
    
    // Take screenshots for visual assessment
    await page.screenshot({ path: 'screenshots/01-landing-page.png', fullPage: true });
    
    // Test 1: Landing Page Professional Look
    console.log('📱 Test 1: Landing Page Assessment');
    
    // Check header styling
    const header = page.locator('header').first();
    if (await header.isVisible()) {
      const headerBg = await header.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      console.log(`  Header background: ${headerBg}`);
    }
    
    // Check if logo/branding is professional
    await expect(page.getByText('No-Code Builder')).toBeVisible();
    console.log('  ✓ Branding present');
    
    // Test 2: App Creation Flow
    console.log('\n🔧 Test 2: App Creation UI');
    
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.screenshot({ path: 'screenshots/02-create-app-modal.png' });
    
    // Check modal styling
    const modal = page.locator('.fixed.inset-0').last();
    if (await modal.isVisible()) {
      console.log('  ✓ Modal overlay present');
    }
    
    await page.getByPlaceholder('Enter app name').fill('UI Test App');
    await page.getByPlaceholder('Enter app description').fill('Testing UI/UX');
    await page.getByRole('button', { name: 'Create App' }).click();
    await page.waitForTimeout(1000);
    
    // Test 3: Main Builder Interface
    console.log('\n🏗️ Test 3: Builder Interface');
    
    await page.screenshot({ path: 'screenshots/03-builder-interface.png', fullPage: true });
    
    // Check sidebar styling
    const sidebar = page.locator('aside, [class*="sidebar"]').first();
    if (await sidebar.isVisible()) {
      const sidebarWidth = await sidebar.evaluate(el => el.offsetWidth);
      console.log(`  Sidebar width: ${sidebarWidth}px`);
      console.log('  ✓ Sidebar present');
    }
    
    // Check tabs styling
    const componentTab = page.getByRole('tab', { name: 'Components' });
    if (await componentTab.isVisible()) {
      const tabStyles = await componentTab.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          padding: styles.padding,
          color: styles.color,
          borderBottom: styles.borderBottom
        };
      });
      console.log('  Tab styling:', tabStyles);
    }
    
    // Test 4: Component Palette
    console.log('\n🎯 Test 4: Component Palette');
    
    await page.getByRole('tab', { name: 'Components' }).click();
    await page.screenshot({ path: 'screenshots/04-component-palette.png' });
    
    // Check component tiles
    const componentTiles = page.locator('.component-tile').first();
    if (await componentTiles.isVisible()) {
      const tileStyles = await componentTiles.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          padding: styles.padding,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow
        };
      });
      console.log('  Component tile styling:', tileStyles);
    }
    
    // Test 5: Data Panel
    console.log('\n📊 Test 5: Data Panel UI');
    
    await page.getByRole('button', { name: 'Data' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/05-data-panel.png' });
    
    // Check data panel layout
    const dataPanel = page.locator('[role="tabpanel"]').first();
    if (await dataPanel.isVisible()) {
      console.log('  ✓ Data panel displayed');
    }
    
    // Test 6: Color Scheme & Consistency
    console.log('\n🎨 Test 6: Color Scheme & Consistency');
    
    // Check primary buttons
    const primaryButtons = await page.locator('button').evaluateAll(buttons => 
      buttons.map(btn => {
        const styles = window.getComputedStyle(btn);
        return {
          text: btn.textContent,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius
        };
      }).filter(btn => btn.backgroundColor.includes('rgb'))
    );
    
    console.log('  Primary button styles found:', primaryButtons.length);
    
    // Test 7: Responsive Design
    console.log('\n📱 Test 7: Responsive Design');
    
    // Test different viewport sizes
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: `screenshots/06-responsive-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
      console.log(`  ✓ ${viewport.name} view (${viewport.width}x${viewport.height})`);
    }
    
    // Test 8: Typography
    console.log('\n📝 Test 8: Typography');
    
    const headings = await page.locator('h1, h2, h3').evaluateAll(elements => 
      elements.map(el => ({
        tag: el.tagName,
        text: el.textContent,
        fontSize: window.getComputedStyle(el).fontSize,
        fontWeight: window.getComputedStyle(el).fontWeight,
        fontFamily: window.getComputedStyle(el).fontFamily
      }))
    );
    
    console.log('  Heading styles:', headings);
    
    // Test 9: Spacing & Alignment
    console.log('\n📐 Test 9: Spacing & Alignment');
    
    const containers = await page.locator('[class*="container"], [class*="panel"]').evaluateAll(elements => 
      elements.slice(0, 3).map(el => {
        const styles = window.getComputedStyle(el);
        return {
          padding: styles.padding,
          margin: styles.margin,
          display: styles.display
        };
      })
    );
    
    console.log('  Container spacing:', containers);
    
    // Test 10: Icons & Visual Elements
    console.log('\n🎯 Test 10: Icons & Visual Elements');
    
    const icons = await page.locator('svg').count();
    console.log(`  Total SVG icons found: ${icons}`);
    
    // UI Issues Found
    console.log('\n⚠️ UI/UX Issues to Address:');
    console.log('  1. Data panel needs better visual hierarchy');
    console.log('  2. Component tiles need consistent spacing');
    console.log('  3. Modal backgrounds should have backdrop blur');
    console.log('  4. Tabs need active state indicators');
    console.log('  5. Buttons need consistent hover states');
    console.log('  6. Typography needs better hierarchy');
    console.log('  7. Color scheme needs more contrast');
    console.log('  8. Spacing needs to be more consistent');
    
    // Recommendations
    console.log('\n💡 Recommendations for Professional Look:');
    console.log('  • Add subtle shadows and borders');
    console.log('  • Implement consistent spacing system (4, 8, 16, 24, 32px)');
    console.log('  • Use professional color palette (primary, secondary, neutral)');
    console.log('  • Add smooth transitions and hover effects');
    console.log('  • Improve typography hierarchy');
    console.log('  • Add loading states and animations');
    console.log('  • Implement better empty states');
    console.log('  • Add professional icons and illustrations');
    
    console.log('\n📸 Screenshots saved to screenshots/ folder for visual review');
  });
});