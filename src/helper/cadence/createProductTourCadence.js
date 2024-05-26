// Utils
const logger = require('../../utils/winston');
const {
  CADENCE_PRIORITY,
  CADENCE_STATUS,
  CADENCE_TYPES,
  NODE_TYPES,
  CRM_INTEGRATIONS,
  USER_LANGUAGES,
} = require('../../utils/enums');
const {
  INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE,
} = require('../../utils/constants');
const { DB_TABLES } = require('../../utils/modelEnums');

// Repositories
const Repository = require('../../repository');

// * Helpers and Services
const addNodeToCadence = require('./addNodeToCadence');

const STEP_1_MAIL_BODY = {
  [USER_LANGUAGES.ENGLISH]: `<p>Hi {{first_name}},</p><p>&nbsp;</p><p>Your team uses all sorts of tools to perform their job - from laptops to cell phones, CRMs and emails. This can make things hard to keep track of and can get expensive.</p><p>&nbsp;</p><p>Ringover works with call centers like yours to help them switch from outdated phone systems to a sleek, fully integrated cloud communication suite that can consolidate and easily manage calls, automatically forward calls, create call campaigns, and more - and all from the same place. With everything you need centralized in one place, you save time and money and no longer have to juggle between different devices or tools.</p><p>&nbsp;</p><p>Interested in learning more about how Ringover's cloud communication suite can modernize your tech stack?</p><p>&nbsp;</p><p>Let's connect! You can book a slot to chat with me here.</p><p>&nbsp;</p><p>Talk to you soon!</p><p>&nbsp;</p><p>Best,</p><p>{{sender_first_name}}</p><p>{{unsubscribe(Unsubscribe Now)}}</p>`,
  [USER_LANGUAGES.FRENCH]: `<p>Bonjour {{first_name}},</p><p>&nbsp;</p><p>Votre équipe utilise toutes sortes d'outils pour accomplir son travail, des ordinateurs portables aux téléphones mobiles, en passant par les CRMs et les e-mails. Cela peut rendre difficile le suivi des choses et peut devenir coûteux.</p><p>&nbsp;</p><p>Ringover collabore avec des centres d'appels comme le vôtre pour les aider à passer des systèmes téléphoniques obsolètes à une suite de communication cloud entièrement intégrée, qui peut consolider et gérer facilement les appels, transférer automatiquement les appels, créer des campagnes d'appels, et bien plus encore, le tout depuis le même endroit. Avec tout ce dont vous avez besoin centralisé en un seul endroit, vous gagnez du temps et de l'argent, et vous n'avez plus à jongler entre différents appareils et outils.</p><p>&nbsp;</p><p>Vous souhaitez en savoir plus sur la manière dont la suite de communication cloud de Ringover peut moderniser votre pile technologique ?</p><p>&nbsp;</p><p>Connectons-nous ! Vous pouvez réserver un créneau pour discuter avec moi ici.</p><p>&nbsp;</p><p>À bientôt !</p><p>&nbsp;</p><p>Cordialement,</p><p>{{sender_first_name}}</p><p>{{unsubscribe(Désabonnez-vous maintenant)}}</p>`,
  [USER_LANGUAGES.SPANISH]: `<p>Hola {{first_name}}:</p><p>&nbsp;</p><p>Tu equipo utiliza todo tipo de herramientas para realizar su trabajo, desde ordenadores portátiles hasta teléfonos móviles, CRMs y correos electrónicos; lo que puede dificultar el seguimiento y aumentar los gastos.</p><p>&nbsp;</p><p>Ringover colabora con centros de llamadas como el tuyo para facilitar la transición de sistemas telefónicos obsoletos a una solución de comunicación en la nube totalmente integrada y moderna, la cual puede consolidar y administrar llamadas, reenviarlas automáticamente, crear campañas de llamadas y mucho más, todo desde un único lugar. Al centralizar todo lo necesario en un solo lugar, ahorras tiempo y dinero, y ya no tienes que alternar entre distintos dispositivos o herramientas.</p><p>&nbsp;</p><p>¿Deseas obtener más información sobre cómo la suite de comunicación en la nube de Ringover puedemodernizar tus recursos tecnológicos?</p><p>&nbsp;</p><p>¡Hablemos! Puedes reservar un horario para hablar conmigo aquí.</p><p>&nbsp;</p><p>¡Hasta pronto!</p><p>&nbsp;</p><p>Cordialmente,</p><p>{{sender_first_name}}</p><p>{{unsubscribe(Desuscribirse ahora)}}</p>`,
};

const STEP_1_MAIL_SUBJECT = {
  [USER_LANGUAGES.ENGLISH]: `Integrate your tools with AI-powered Cloud Communication`,
  [USER_LANGUAGES.FRENCH]: `Intégrez vos outils avec la Communication Cloud alimentée par l'IA`,
  [USER_LANGUAGES.SPANISH]: `Integra tus herramientas con la Comunicación en la Nube impulsada por IA`,
};

const STEP_2_CALL_SCRIPT = {
  [USER_LANGUAGES.ENGLISH]: `<p>Hi {{first_name}} this is {{sender_first_name}} with Ringover, do you have a moment?</p><p><br>I'm reaching out because we partner with call centers to update and improve their phone systems. We are a global cloud communications provider with AI capabilities, integrations, and analytics all in one dashboard.&nbsp;<br>&nbsp;</p><p>I know I jumped into your day, my goal is to set some time for later this week to show you how we can improve your business comms and probably save you money.<br>&nbsp;</p><p>Are you free tomorrow or the next day for 20-30 minutes?</p>`,
  [USER_LANGUAGES.FRENCH]: `<p>Bonjour {{first_name}}, je suis {{sender_first_name}} de Ringover, avez-vous instant à m'accorder?</p><p><br>Je vous contacte parce que nous collaborons avec les centres d'appels pour mettre à jour et améliorer leurs systèmes téléphoniques. Nous sommes un fournisseur mondial de communications cloud avec des capacités d'IA, des intégrations et des analytiques le tout dans un seul tableau de bord.</p><p><br>Je sais que je me suis immiscé dans votre journée, mon objectif est de fixer un rendez-vous plus tard cette semaine pour vous montrer comment nous pouvons améliorer les communications de votre entreprise et probablement vous faire économiser de l'argent.<br>&nbsp;</p><p>Êtes-vous disponible demain ou le jour suivant pour 20 à 30 minutes ?</p>`,
  [USER_LANGUAGES.SPANISH]: `<p>Hola {{first_name}}, soy {{sender_first_name}} de Ringover, ¿tienes un momento?</p><p><br>Te contacto porque Ringover colabora con centros de llamadas, actualizándolos y mejorando sus sistemas telefónicos. Somos un proveedor global de comunicaciones cloud con funcionalidades de inteligencia artificial, integraciones y análisis, ¡todo en una misma plataforma!</p><p><br>Soy consciente de que tienes una agenda muy apretada, sin embargo, me gustaría concertar una reunión contigo cuando tengas un hueco y poder demostrarte cómo podemos optimizar tus comunicaciones de empresa y, de paso, reducir costes. ¿Estarías disponible unos 20 o 30 minutos mañana o al día siguiente?</p>`,
};

const STEP_3_SMS_MESSAGE = {
  [USER_LANGUAGES.ENGLISH]: `Hi {{first_name}},\n\nI would love to chat with you about your call center phone system and how I think Ringover can boost your productivity! I only need 20 minutes of your time. Are you free this week for a quick call?\n\n{{sender_first_name}}`,
  [USER_LANGUAGES.FRENCH]: `Bonjour {{first_name}},\n\nJ'aimerais discuter avec vous de votre système téléphonique de centre d'appels et comment je pense que Ringover peut augmenter votre productivité ! J'aurais juste besoin de 20 minutes de votre temps. Êtes-vous disponible cette semaine pour un appel rapide ?\n\n{{sender_first_name}}`,
  [USER_LANGUAGES.SPANISH]: `Hola {{first_name}},\n\nMe gustaría discutir contigo sobre el sistema telefónico de tu centro de llamadas y cómo Ringover puede potenciar tu productividad. Solo necesito 20 minutos de tu tiempo.\n\n¿Tienes disponibilidad esta semana para una llamada rápida?\n\n{{sender_first_name}}`,
};

const STEP_4_LINKEDIN_CONNECTION_REQUEST_MESSAGE = {
  [USER_LANGUAGES.ENGLISH]: `Hi {{first_name}}, \n\nI would love to connect.\n\nBest regards,\n{{sender_first_name}}`,
  [USER_LANGUAGES.FRENCH]: `Bonjour {{first_name}}, \n\nj'aimerais que nous soyons en contact.\n\nCordialement,\n{{sender_first_name}}`,
  [USER_LANGUAGES.SPANISH]: `Hola {{first_name}}, me gustaría conectar contigo.\n\nCordialmente,\n{{sender_first_name}}`,
};

/**
 creates a personal cadence for product tour for a user
  @param {string} company_id id of the company
  @param {string} user_id id of the user for whom cadence needs to be created 
  @param {string} user_name first name of the user for whom cadence needs to be created 
  @param {string} timezone timezone of the user for whom cadence needs to be created 
  @param {string} integration_type integration_type of the company
  enum to be used: CRM_INTEGRATIONS
  @param t sequelize.transaction
 */
const createProductTourCadence = async ({
  company_id,
  user_id,
  user_name,
  user_language,
  timezone,
  integration_type,
  t,
}) => {
  try {
    // Step: Validation for parameters
    if (!Object.values(CRM_INTEGRATIONS).includes(integration_type))
      return [null, `Specified integration is not valid`];
    if (!user_id || !company_id || !user_name)
      return [null, `All arguments not specified`];
    // if timezone is null or is not passed, then pass as undefined so server's timezone will be used
    if (!timezone) timezone = undefined;
    // if user_language is null or not passed, then use USER_LANGUAGES.ENGLISH
    if (!user_language) user_language = USER_LANGUAGES.ENGLISH;

    // if integration_type === CRM_INTEGRATIONS.SHEETS, then update it to null as integration_type for cadence in sheets is set at the time of import depending on whether csv leads or google sheets leads are imported
    if (integration_type === CRM_INTEGRATIONS.SHEETS) integration_type = null;

    // Step: create cadence
    const [cadence, errForCadence] = await Repository.create({
      tableName: DB_TABLES.CADENCE,
      createObject: {
        company_id,
        description: 'Cadence for product tour',
        inside_sales: '0',
        integration_type: integration_type,
        salesforce_cadence_id: INTEGRATION_ID_FOR_PRODUCT_TOUR_CADENCE,
        name: `Cadence demo ${user_name} ${new Date().toLocaleString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          timeZone: timezone,
        })}`,
        priority: CADENCE_PRIORITY.STANDARD,
        remove_if_bounce: false,
        remove_if_reply: false,
        scheduled: false,
        status: CADENCE_STATUS.NOT_STARTED,
        type: CADENCE_TYPES.PERSONAL,
        user_id: user_id,
      },
      t,
    });
    if (errForCadence) return [null, errForCadence];

    // Declare nodes to create
    let nodes = [
      {
        name: 'Mail',
        type: NODE_TYPES.MAIL,
        is_urgent: false,
        is_first: true,
        step_number: 1,
        data: {
          aBTestEnabled: false,
          attachments: [],
          //body: '<p>&nbsp;</p><p>Please, Click here to {{unsubscribe(unsubscribe)}}</p>',
          //subject: '{{company_name}} || {{full_name}}',
          body: STEP_1_MAIL_BODY[user_language],
          subject: STEP_1_MAIL_SUBJECT[user_language],
          templates: [],
        },
        wait_time: 0,
      },
      {
        name: 'Call',
        type: NODE_TYPES.CALL,
        is_urgent: false,
        is_first: false,
        step_number: 2,
        data: {
          //script: 'Here you can have a script for the call',
          script: STEP_2_CALL_SCRIPT[user_language],
        },
        wait_time: 0,
      },
      {
        name: 'SMS',
        type: NODE_TYPES.MESSAGE,
        is_urgent: false,
        is_first: false,
        step_number: 3,
        data: {
          aBTestEnabled: false,
          //message: 'Hello {{full_name}}, this is a test sms',
          message: STEP_3_SMS_MESSAGE[user_language],
          tcpa_policy_check: true,
          templates: [],
        },
        wait_time: 0,
      },

      {
        name: 'Connection Request',
        type: NODE_TYPES.LINKEDIN_CONNECTION,
        is_urgent: false,
        is_first: false,
        step_number: 4,
        data: {
          //message: 'Hello {{full_name}}, I want to connect with you',
          message: STEP_4_LINKEDIN_CONNECTION_REQUEST_MESSAGE[user_language],
        },
        wait_time: 0,
      },
    ];

    // Step: create nodes
    let previousNode = null;
    for (let node of nodes) {
      node.cadence_id = cadence.cadence_id;

      // create a node
      const [createdNode, errForNode] = await addNodeToCadence(
        node,
        previousNode?.node_id
      );
      if (errForNode) return [null, errForNode];
      previousNode = createdNode;
    }

    logger.info('Successfully created product tour Cadence');
    return [cadence, null];
  } catch (err) {
    logger.error(
      'An error occurred while creating product tour cadence: ',
      err
    );
    return [null, err.message];
  }
};

//createProductTourCadence({
//user_id: 'bed5dd94-872e-4780-929b-1d72ea136099',
//company_id: '0fc08e9a-eba5-4ebe-8151-42c52a440146',
//integration_type: 'pipedrive',
//user_name: 'Test',
//});

module.exports = createProductTourCadence;
