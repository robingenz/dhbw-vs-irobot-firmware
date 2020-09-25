export class Utils {
    public static timeout(timeoutMs: number): Promise<void> {
        return new Promise(r => setTimeout(r, timeoutMs));
    }
}
