var languages = {
    PageTitle: "Oviyam",
    VersionNo:"2.8.2",
    UserName: "Имя пользователя",
    Password: "Пароль",
    Login: "Логин",
    Footer: "Для Oviyam 2.8.2 требуется последняя версия Google Chrome / Safari / Mozila Firefox.",
    PatientName: "Имя пациета",
    PatientId: "ID Пациента",
    BirthDate: "Дата рождения",
    AccessionNumber: "Номер доступа",
    FromStudyDate: "Дата исследования(Начните)",
    ToStudyDate: "Дата исследования (конец)",
    StudyDate: "Дата исследования ",
    StudyDesc: "Описание исследования",
    ReferPhysician: "Направивший врач",
    Modality: "Модальность",
    InstanceCount: "Количество экземпляров",
    Reset: "Сброс",
    Search: "Поиск",
    Layout: "Расположение",
    Windowing: "Яркость/Контраст",
    Zoom: "Приближение",
    Move: "Захват изображения",
    ScoutLine: "ScoutLine",
    ScrollImage: "Прокрутка изображения",
    Synchronize: "Синхронизировать",
    VFlip: "Вертикальное отображение",
    HFlip: "Горизонтальное отображение",
    LRotate: "Поворот влево",
    RRotate: "Поворот вправо",
    Invert: "Инвертировать",
    TextOverlay: "Наложение текста",
    FullScreen: "Полноэкранный",
    MetaData: "Метаданные",
    Lines: "Измерение расстояния",
    Server: "Сервер",
    QueryParam: "Параметры запроса",
    Preferences: "Предпочтения",
    Verify: "Проверка",
    Add: "Добавить",
    Edit: "Правка",
    Delete: "Удалить",
    Description: "Описание",
    HostName: "Название Хоста",
    AETitle: "AE заглавие",
    Port: "Порт",
    Retrieve: "Извлечь",
    Update: "Обновление",
    FilterName: "Фильтр по имени",
    StudyDateFilter: "Фильтр по дате исследования",
    StudytimeFilter: "Фильтр по времени исследования",
    ModalityFilter: "Фильтр по модальности",
    AutoRefresh: "Автообновление",
    IOviyamCxt: "iOviyam контекст",   
    disclaimer: "Эта версия Oviyam, являющаятся бесплатным программным обеспечением с открытым исходным кодом (FOSS), не сертифицирована как коммерческое медицинское устройство. (FDA or CE-1).",
    limitation: "Пожалуйста, свяжитесь с местным офисом соответствия для уточнения возможных ограничений в клиническом использовании.",
    Brain: "Мозг",
    Abdomen: "Живот",
    Lung: "Легкое",
    Bone: "Кость",
    Head: "Голова/Шея",
    Default: "По умолчанию",
    Line: "Line",
    Rectangle: "Прямоугольник",
    Oval: "Овал",
    Angle: "Угол",
    DeleteAll: "Удалить все",
    Workstation: "DICOM рабочая веб станция",
    Version: "Версия",
    RememberMe: "Запомнить",
    Creteria: "Не выбраны критерии поиска",
	Message: "Фильтры не выбраны. Поиск может занять много времени. Вы хотите продолжить?",
	ViewerPreference: "Настройки просмотра",
    prefetch: "Предварительно получить другие исследования выбранного пациента",
    sessTimeout: "Тайм-аут сеанса",
    Filter: "Фильтр:",
    LengthMenu: "Показывать _MENU_ записей на странице",
    ZeroRecords: "Данные отсутствуют в таблице",
    Info: "Отображение _START_ для _END_ из _TOTAL_ записей",
    InfoEmpty: "Нет доступных записей",
    InfoFiltered: "(отфильтровано по итоговым записям _MAX_)",
    Gender: "Пол",
    Tools: "Инструменты",
    Settings: "Настройки",
    About: "О",
    OviyamAbout: "Об ОВИЯМ",
    VersionInfo: "Информация о версии",
    VersionNoTxt: "Номер версии",
    BuildNo: "Номер сборки",
    Browser: "Браузер",
    Os: "Операционные системы",
    logout: "Смена пользователя",
    language: "Язык",
    country: "Выбор страны",
    deleteWarn: "Пожалуйста, выберите сервер для удаления",
    queryDeleteWarn: "Пожалуйста, выберите параметр запроса для удаления",
    editWarn: "Пожалуйста, выберите сервер для редактирования",
    verifyWarn: "Пожалуйста, выберите сервер для подтверждения",
    addWarn: "Пожалуйста, введите все детали",
    existWarn: "Имя сервера уже существует!!!",
    addSuccess: "Сервер успешно добавлен",
    editSuccess: "Сервер успешно отредактирован",
    deleteSuccess: "Сервер успешно удален",
    serverUnavailable: "Сервер недоступен",
    listenerUpdateSuccess: "Сведения о слушателе обновлены, и слушатель был перезапущен!!!",
    listenerUpdateError: "Ошибка при обновлении данных слушателя!!!",
    overlayUpdateSuccess: "Настройки наложения текста успешно обновлены",
    overlayUpdateError: "Не удалось обновить наложение текста",
    iOviyamUpdateSuccess: "iOviyam контекст был успешно обновлен!!!",
    iOviyamUpdateError: "Ошибка при обновлении контекста iOviyam!!!",
    downloadUpdateSuccess: "Загрузка настройки исследования успешно обновлены!!!",
    downloadUpdateError: "Ошибка при обновлении настроек Загрузки исследования!!!",
    nameConfigUpdateSuccess: "Конфигурация отображения имени успешно обновлена !!!",
    nameConfigUpdateError: "Ошибка при обновлении конфигурации отображения имени !!!",
    modalityValidError: "Пожалуйста, введите правильный модальный список",
    overlayReadError: "Не удалось прочитать настройки наложения текста",
    overlayResetError: "Не удалось сбросить настройки наложения текста",
    iOviyamEmpty: "iOviyam контекст не должен быть пустым!!!",
    iOviyamInValid: "iOviyam контекст должен начинаться с /",
    themeSelect: "Выберите предпочитаемую тему",
    locale: "Locale ID",
    dwnldHeader: "Загрузка изображения",
    downloadImgLbl: "Пользователи могут скачать изображения",
    nameConfigHeader: "Конфигурация отображения имени",
    removeCaretSymbol: "Удалите разделитель '^' из имен людей для удобства чтения",
    updateSuccess: "Успешно Обновлено",
    updateError: "Не удалось обновить",
    dateFormat:"DD.MM.YYYY",
    serverDelete: "Вы хотите удалить сервер?",
    queryParamDelete: "Вы хотите удалить параметр запроса?"
};
