"use server"

const url = process.env.FLASK_API_URL ?? "http://127.0.0.1:5000/"

export const flash_cards = async (ctx: string) => {
    try {
        const response = await fetch(`${url}/"${ctx}"`);
        if (!response.ok) {
            console.error("There was a problem with the fetch operation:", response.status);
            return "error 1"
        }
        const data = await response.json();
        if (data["error"] === true) {
            return "error 2"
        }
        return data;
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        return "error 3"
    }
}


// @Cooperzilla TODO: Try and see if it can be fixed

export const generate_mcq = async (ctx: string) => {
    try {
        const response = await fetch(`${url}/generate_mcq/${encodeURIComponent(ctx)}`);
        if (!response.ok) {
            console.error("There was a problem with the fetch operation:", response.status);
            return "error 1";
        }
        const data = await response.json();
        if (data["error"] === true) {
            return "error 2";
        }
        return data;
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        return "error 3";
    }
};