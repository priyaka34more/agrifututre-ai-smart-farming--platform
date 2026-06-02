from models.activity_model import UserActivity


def log_activity(

    db,

    user_id,

    module,

    action,

    result="",

    extra_data=""
):

    activity = UserActivity(

        user_id=user_id,

        module=module,

        action=action,

        result=result,

        extra_data=extra_data
    )

    db.add(activity)

    db.commit()