const escape = (payload) => {
    return payload.toString().replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

const chooseQuestionContainer = document.querySelector("#choose-question-container");

const QuestionIdentifier = (idx) => {
    const hasChosenAnswer = chosenAnswers[idx] !== undefined;
    const isCurrentQuestion = currentQuestion === idx;

    let classes;

    if (hasChosenAnswer && isCurrentQuestion) classes = `bg-blue-800`;
    else if (hasChosenAnswer) classes = `hover:bg-blue-800 bg-blue-900`
    else if (isCurrentQuestion) classes = `bg-stone-800`
    else classes = `hover:bg-stone-800`

    return `<div class="p-5 text-center text-3xl text-neutral-200 rounded-xl cursor-pointer ${classes}" onclick="switchQuestion(${escape(idx)})">${escape(idx + 1)}</div>`;
}

const renderTemplate = (template) => {
    const div = document.createElement("div");
    div.innerHTML = template;

    return div.firstChild;
}

const contentContainer = document.querySelector("#content-container");

const switchQuestion = (questionNumber) => {
    currentQuestion = questionNumber;
    contentContainer.innerHTML = "";
    contentContainer.appendChild(renderTemplate(QuestionContainer(questions[questionNumber])));
    renderQuestionIdentifiers();
}

const chosenAnswers = [];

const getChosenAnswersLength = () => chosenAnswers.reduce((acc, cv) => (cv) ? acc + 1 : acc, 0);

const chooseAnswer = (answerId) => {
    chosenAnswers[currentQuestion] = answerId;

    if (currentQuestion + 1 != questions.length) {
        currentQuestion++;
    }

    switchQuestion(currentQuestion);
}

const QuestionContainer = ({ question, code, image, answers }) => {
    const chosenAnswer = chosenAnswers[currentQuestion];

    return `<div class="w-full max-w-lg sm:max-w-xl lg:max-w-3xl p-5 flex flex-col items-center justify-center gap-8 mx-auto">
    <p class="text-3xl text-neutral-300 font-semibold">${escape(question)}</p>

    ${code !== null ? `<code class="w-full rounded-xl bg-stone-800 p-5 overflow-y-scroll text-neutral-300">${code}</code>` : ""}
    ${image !== null ? `<img src="${image}" />` : ""}

    <div class="flex flex-col w-full gap-4">
        ${answers.map((answer, idx) => {
            return `<div onclick="chooseAnswer(\`${escape(answer.id)}\`)" class="text-neutral-300 p-3 px-5 cursor-pointer hover:bg-blue-800 duration-300 rounded-xl answer ${chosenAnswer === answer.id ? 'bg-blue-800' : 'bg-stone-800'}">${escape(answer.label)}</div>`
        }).join("")}
    </div>

    ${currentQuestion === questions.length - 1 ? `<div class="flex flex-row justify-end items-center w-full">
        <button class="px-5 py-2 rounded-xl font-semibold ${getChosenAnswersLength() === questions.length ? 'bg-blue-800 text-neutral-200' : 'bg-stone-800 text-neutral-400" disabled'} id="ending-button" onclick="end()">Zakończ</button>
</div>` : ``}
</div>`;
}

const end = () => {
    window.__TAURI__.invoke('check_answers', answers);
}

let currentQuestion = 0, questions, questionsCount;

const renderQuestionIdentifiers = () => {
    chooseQuestionContainer.innerHTML = "";

    for (let i = 0; i < questionsCount; i++) {
        chooseQuestionContainer.appendChild(renderTemplate(QuestionIdentifier(i)));
    }
}

const main = async () => {
    questionsCount = await window.__TAURI__.invoke('get_question_count_from_state');
    questions = await window.__TAURI__.invoke('get_all_questions_from_state');

    for (let i = 0; i < questionsCount; i++) {
        chooseQuestionContainer.appendChild(renderTemplate(QuestionIdentifier(i)));
    }

    contentContainer.appendChild(renderTemplate(QuestionContainer(questions[currentQuestion])));
}

main();
