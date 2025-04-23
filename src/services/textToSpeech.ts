
class TextToSpeechService {
  private speechSynthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;

  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    // Load voices when available
    if (this.speechSynthesis.onvoiceschanged !== undefined) {
      this.speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
    this.loadVoices();
  }

  private loadVoices(): void {
    this.voices = this.speechSynthesis.getVoices();
  }

  public speak(text: string, options: { rate?: number; pitch?: number; voice?: string } = {}): void {
    if (!text) return;

    // Stop any ongoing speech
    this.stop();

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set optional parameters
    if (options.rate) utterance.rate = options.rate;
    if (options.pitch) utterance.pitch = options.pitch;
    
    // Set voice if specified and available
    if (options.voice && this.voices.length > 0) {
      const selectedVoice = this.voices.find(voice => voice.name === options.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    // Set up event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
    };
    
    // Start speaking
    this.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

// Create a singleton instance
const textToSpeechService = new TextToSpeechService();

export default textToSpeechService;
