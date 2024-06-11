// Adjusted jwt-decode.d.ts
declare module 'jwt-decode' {
    function jwtDecode(token: string): any; // Adjust the return type according to the decoded JWT structure
    export default jwtDecode;
}