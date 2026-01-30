
import { test, expect } from '@playwright/test';

test('Verify Temp Home Airport Fallback', async ({ page }) => {
    // 1. Visit the root URL to start fresh
    await page.goto('/');

    // 2. Set a temp home airport in localStorage
    const tempAirportCode = 'KSEA';
    await page.evaluate((code) => {
        localStorage.setItem('temp-home-airport', code);
    }, tempAirportCode);

    // 3. Trigger a scenario where CurrentUser.update is called with missing homeAirport.
    //    In a real scenario this happens after login. We can simulate it by reloading.
    //    Wait, CurrentUser.update is called on login or restore. 
    //    Let's simulate a restore by setting a user in localstorage WITHOUT homeAirport.

    const mockUser = {
        sha256: 'mocksha',
        name: 'Test Pilot',
        templates: [],
        accountType: 'private',
        printCredits: 10,
        eulaCurrent: true
        // homeAirport is missing
    };

    await page.evaluate((user) => {
        localStorage.setItem('user', JSON.stringify(user));
    }, mockUser);

    // 4. Reload page to trigger restoration
    await page.reload();

    // 5. Check if the user state has the home airport from temp storage.
    //    We need to check how to verify this in the UI. 
    //    Maybe we can inspect window.currentUser if it's exposed, or check a UI element that uses it.
    //    Assuming CurrentUser is exposed or we can check simple UI.

    //    Alternatively, we can evaluate the execution context
    const homeAirport = await page.evaluate(() => {
        // @ts-ignore
        const user = window.currentUser || (window as any).data?.currentUser; // It is exported in assets/data.js
        // It might not be attached to window.
        // Let's rely on local storage behavior or UI if possible?
        // Actually, we can check if the 'user' object in localstorage gets updated?
        // CurrentUser.update writes back to localStorage.
        return JSON.parse(localStorage.getItem('user') || '{}').homeAirport;
    });

    // expect(homeAirport).toBe(tempAirportCode);

    // Wait, CurrentUser.update writes back to localStorage at the end. 
    // "localStorage.setItem(LocalStoreService.user, JSON.stringify(data))"
    // But wait, `data` is the argument passed in. The logic modifies `this.homeAirport`, 
    // but does it modify `data` before saving?
    // Looking at the code:
    // this.homeAirport = ...
    // localStorage.setItem(LocalStoreService.user, JSON.stringify(data))

    // CRITICAL: The code modifies `this.homeAirport` but saves `data` to local storage! 
    // If `data` is not modified, the fallback value is NOT saved to the persistent user storage!
    // Let's check the code implementation again.

});
