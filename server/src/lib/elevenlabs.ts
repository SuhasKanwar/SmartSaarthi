import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY || "YOUR_API_KEY",
});

export const generateSpeech = async (text: string): Promise<Buffer> => {
    try {
        const audio = await client.textToSpeech.convert(
            "JBFqnCBsd6RMkjVDRZzb",
            {
                text,
                model_id: "eleven_multilingual_v2",
                output_format: "mp3_44100_128",
            }
        );

        // Convert the stream or chunks to a single Buffer
        const chunks: Buffer[] = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        return buffer;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw error;
    }
};
