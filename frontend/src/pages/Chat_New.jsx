import React, { useState, useEffect, useRef } from "react";
import { Bot, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function Chat() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [state, setState] = useState({
    messages: [],
    input: "",
    isTyping: false,
  });

  const { messages, input, isTyping } = state;

  const languageLabels = {
    en: "English",
    hi: "हिंदी",
    mr: "मराठी",
  };

  const botResponses = {
    fertilizer: {
      en: "For wheat, I recommend using NPK 20:20:0 fertilizer at 40-50 kg per acre as basal application, followed by 25-30 kg of urea as top dressing 25-30 days after sowing. Consider adding 1-2 tons of FYM or compost before sowing for better soil health.",
      hi: "गेहूँ के लिए, मैं बेस आवेदन के रूप में 40-50 किलो प्रति एकड़ NPK 20:20:0 खाद और 25-30 दिनों के बाद 25-30 किलो यूरिया की टॉप ड्रेसिंग की सलाह देता हूँ। बुवाई से पहले 1-2 टन गोबर की खाद या कम्पोस्ट डालें।",
      mr: "गव्हासाठी, मी बेस प्रक्रियेसाठी प्रति एकर 40-50 किलो NPK 20:20:0 खत आणि 25-30 दिवसांनी 25-30 किलो यूरेयाची टॉप ड्रेसिंग करण्याची शिफारस करतो. पेरण्या आधी 1-2 टन शेणखत किंवा कंपोस्ट घाला."
    },
    leafBlight: {
      en: "For tomato leaf blight, I recommend: 1) Remove and destroy infected plants immediately, 2) Apply copper-based fungicides, 3) Ensure proper spacing for air circulation, 4) Avoid overhead irrigation, 5) Use resistant varieties for future planting.",
      hi: "टमाटर की पत्ती के दाने के लिए: 1) संक्रमित पौधों को तुरंत हटा दें और नष्ट करें, 2) तांबे आधारित फफूंदनाशक का छिड़काव करें, 3) हवा के प्रवाह के लिए उचित दूरी रखें, 4) ऊपर से पानी देने से बचें, 5) भविष्य में प्रतिरोधी किस्मों का उपयोग करें।",
      mr: "टोमॅटोच्या पानांच्या दागांसाठी: 1) संक्रमित रोप लगेच काढून नष्ट करा, 2) तांबे आधारित कवकत उपाय करा, 3) हवा येण्यासाठी योग्य अंतर ठेवा, 4) वरून पाणी देणे टाळा, 5) भविष्यात प्रतिरोधक जाती वापरा."
    },
    market: {
      en: "Current rice market price is approximately ₹2,400-2,600 per quintal, varying by quality and region. Prices are expected to remain stable with a slight upward trend in the coming weeks due to festival season demand.",
      hi: "चावल की वर्तमान मंडी कीमत लगभग ₹2,400-2,600 प्रति क्विंटल है, जो गुणवत्ता और क्षेत्र के अनुसार बदल सकती है। त्योहार के मौसम की मांग के कारण आने वाले हफ्तों में कीमतें थोड़ी बढ़ सकती हैं।",
      mr: "वर्तमान तांदळाची बाजारभाव सुमारे ₹2,400-2,600 प्रती क्विंटल आहे, जी गुणवत्ता आणि भागानुसार बदलू शकते. सणाच्या हंगामामुळे पुढील काही आठवड्यांत किंमतीत थोडी वाढ अपेक्षित आहे."
    },
    weather: {
      en: "The weather forecast for the coming week looks favorable for farming activities. Expect moderate temperatures between 25-32°C with scattered rainfall in some regions. Good conditions for crop growth and field operations.",
      hi: "आने वाले हफ्ते का मौसम खेती के लिए अच्छा दिखता है। तापमान 25-32°C के बीच रहेगा और कुछ इलाकों में बिखरी हुई बारिश हो सकती है। यह फसल वृद्धि और खेत के कामों के लिए अच्छा समय है।",
      mr: "पुढील आठवड्याच्या हवामान अंदाजानुसार शेतीसाठी अनुकूल स्थिती आहे. तापमान 25-32°C दरम्यान राहील आणि काही भागांत पावसाचा फटका दिसू शकतो. हे पीक वाढीस आणि मातीवर काम करण्यासाठी चांगले आहे."
    },
    schemes: {
      en: "Several government schemes are available: 1) PM-KISAN for direct income support, 2) Crop Insurance schemes, 3) Agricultural credit facilities, 4) Subsidy on agricultural equipment, 5) Soil health card program. Would you like details on any specific scheme?",
      hi: "कई सरकारी योजनाएँ उपलब्ध हैं: 1) PM-KISAN सीधे आय समर्थन के लिए, 2) फसल बीमा योजनाएँ, 3) कृषि ऋण सुविधाएँ, 4) कृषि उपकरणों पर सब्सिडी, 5) मिट्टी स्वास्थ्य कार्ड कार्यक्रम। क्या आप किसी विशेष योजना का विवरण जानना चाहते हैं?",
      mr: "काही सरकारी योजना उपलब्ध आहेत: 1) PM-KISAN थेट उत्पन्न समर्थनासाठी, 2) पीक विमा योजना, 3) कृषी कर्ज सुविधा, 4) कृषी उपकरणांवर अनुदान, 5) माती आरोग्य कार्ड कार्यक्रम. तुम्हाला कोणत्याही विशिष्ट योजनेचा तपशील पाहिजे का?"
    },
    fallback: {
      en: "I'm here to help with agricultural queries. You can ask me about crop diseases, market prices, weather forecasts, farming techniques, or government schemes. What specific information would you like?",
      hi: "मैं कृषि संबंधित सवालों में मदद करने के लिए यहाँ हूँ। आप मुझसे फसल रोग, मंडी भाव, मौसम, खेती के तरीके, या सरकारी योजनाओं के बारे में पूछ सकते हैं। आप किस जानकारी के बारे में जानना चाहते हैं?",
      mr: "मी शेतीशी संबंधित प्रश्नांसाठी मदत करण्यासाठी येथे आहे. तुम्ही मला पीक रोग, बाजारभाव, हवामान अंदाज, शेतीचे तंत्र, किंवा सरकारी योजना याबद्दल प्रश्न विचारू शकता. तुम्हाला कोणती माहिती हवी आहे?"
    }
  };

  const quickSuggestionsMap = {
    en: [
      "Which fertilizer is best for my wheat crop?",
      "How can I stop tomato leaves from turning brown?",
      "What is today’s market price for rice?",
      "Will it rain this week on my farm?",
      "Which government help scheme can I use?"
    ],
    hi: [
      "गेहूँ के लिए सबसे अच्छा खाद कौन सा है?",
      "टमाटर के पत्ते क्यों सूख रहे हैं?",
      "चावल की मंडी का भाव आज क्या है?",
      "इस हफ्ते बारिश होगी क्या?",
      "सरकारी मदद की कौन सी योजना ले सकता हूँ?"
    ],
    mr: [
      "गव्हासाठी कोणते खत चांगले आहे?",
      "टोमॅटोची पाने का पिवळी होत आहेत?",
      "तांदळाची बाजारभाव आज किती आहे?",
      "या आठवड्यात पाऊस येईल का?",
      "सरकारी मदतीची कोणती योजना वापरू शकतो?"
    ]
  };

  const quickSuggestions = quickSuggestionsMap[language] || quickSuggestionsMap.en;
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      input: '',
      isTyping: true
    }));

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botResponse],
        isTyping: false
      }));
    }, 1500);
  };

  const getBotResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();

    if ((lowerInput.includes('fertilizer') || lowerInput.includes('खाद') || lowerInput.includes('खत')) && (lowerInput.includes('wheat') || lowerInput.includes('गेहूँ') || lowerInput.includes('गव्ह'))) {
      return botResponses.fertilizer[language] || botResponses.fertilizer.en;
    } else if ((lowerInput.includes('leaf blight') || lowerInput.includes('पत्ता') || lowerInput.includes('पान') || lowerInput.includes('पत्ती')) && (lowerInput.includes('tomato') || lowerInput.includes('टमाटर') || lowerInput.includes('टोमॅटो'))) {
      return botResponses.leafBlight[language] || botResponses.leafBlight.en;
    } else if ((lowerInput.includes('market price') || lowerInput.includes('मंडी') || lowerInput.includes('भाव') || lowerInput.includes('बाजार')) && (lowerInput.includes('rice') || lowerInput.includes('चावल') || lowerInput.includes('तांदूळ'))) {
      return botResponses.market[language] || botResponses.market.en;
    } else if (lowerInput.includes('weather') || lowerInput.includes('बारिश') || lowerInput.includes('पाऊस') || lowerInput.includes('मौसम')) {
      return botResponses.weather[language] || botResponses.weather.en;
    } else if (lowerInput.includes('government schemes') || lowerInput.includes('सरकारी') || lowerInput.includes('योजना') || lowerInput.includes('योजना')) {
      return botResponses.schemes[language] || botResponses.schemes.en;
    } else {
      return botResponses.fallback[language] || botResponses.fallback.en;
    }
  };

  const handleQuickSuggestion = (suggestion) => {
    setState(prev => ({ ...prev, input: suggestion }));
  };

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3 min-w-0`}>
      <div className={`min-w-0 max-w-[80%] ${message.sender === 'user' ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-3 text-base leading-6 break-words whitespace-pre-wrap ${
          message.sender === 'user'
            ? 'bg-emerald-600 text-white rounded-3xl rounded-br-md'
            : 'bg-slate-100 text-slate-900 rounded-3xl rounded-bl-md border border-slate-200'
        }`} style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif", fontWeight: 500 }}>
          {message.text}
        </div>
        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'}`} style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7f2] flex flex-col" style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', -apple-system, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[420px] mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Noto Sans', sans-serif", fontWeight: 800 }}>AgriFuture Farming App</h1>
            <p className="text-slate-500 text-sm mt-1">AI Assistant for farmers in Hindi, Marathi, or English</p>
            <p className="text-slate-400 text-xs mt-1">Language: {languageLabels[language] || languageLabels.en}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-3 py-4 sm:py-5">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Chat Container */}
          <div className="flex flex-col h-auto max-h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 min-h-[320px]" style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
              {messages.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                    <Bot size={48} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Noto Sans', sans-serif", fontWeight: 800 }}>
                    Welcome to AgriFuture 🚜
                  </h3>
                  <p className="text-gray-600 text-base leading-7 mb-4" style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif", fontWeight: 500 }}>
                    Ask in WhatsApp-style Hindi, Marathi, or simple farm words — about pests, rain, market prices, fertilizer, or government help.
                  </p>
                  {/* Quick Suggestions */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'Noto Sans', sans-serif" }}>💡 Ask like a farmer</p>
                    <div className="grid grid-cols-1 gap-2">
                      {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleQuickSuggestion(suggestion)}
                          className="text-sm py-3 px-3 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all rounded-xl text-left"
                          style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif", fontWeight: 500 }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot size={20} className="text-green-600" />
                        </div>
                        <div className="bg-green-50 rounded-lg px-4 py-3 shadow-sm">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-[#F0EFE9]">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Type like WhatsApp: Hindi, Marathi, or English..."
                  value={input}
                  onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 border border-gray-200 focus:border-green-500 focus:ring-green-300 rounded-full px-4 py-3 text-base bg-white"
                  style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif", fontSize: '16px' }}
                />
                <Button 
                  variant="primary" 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-[#25D366] hover:bg-[#1ebe5b] disabled:bg-gray-400 rounded-full px-4 py-3 text-white font-semibold"
                  style={{ fontFamily: "'Noto Sans', sans-serif", fontWeight: 700 }}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
